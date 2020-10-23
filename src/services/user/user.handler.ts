import db from "../../middlewares/knex";
import { IResetPassword, LoginModel, IUser } from "./user.dto";
import { AESEncryption } from "../../utils/encryption";
const db_connection = require("../../config/db");
const Knex = require("knex");
export class UserHandler {
  public static createUserSchema = {
    schema: {
      tags: ["Authentication"],
      body: {
        type: "object",
        additionalProperties: false,
        properties: {
          email: { type: "string" },
          password: { type: "string", minLength: 8, maxLength: 16 },
          first_name: { type: "string" },
          last_name: { type: "string" },
        },
        required: ["email", "password", "first_name", "last_name"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            token: { type: "string" },
          },
        },
        "4xx": {
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  };

  public static async createUser(user: IUser) {
    const emailExists = await this.emailExists(user.email);
    if (emailExists) {
      throw new Error("Email already exists");
    }
    var kn = new db(Knex, db_connection);
    var trx = await kn.startTransaction();
    try {
      const use = kn
        .getConnection()("users")
        .insert({
          email: user.email,
          password: AESEncryption.encrypt(user.password),
          first_name: user.first_name,
          last_name: user.last_name,
          updated_at: new Date(),
        })
        .returning(["id", "email"]);
      trx.commit();
      return use;
    } catch (error) {
      trx.rollback;
      throw error;
    }
  }

  /** This schema defines the token, on success login */
  public static loginUserSchema = {
    schema: {
      tags: ["Authentication"],
      body: {
        type: "object",
        additionalProperties: false,
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
        required: ["email", "password"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
        },
        "4xx": {
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  };

  public static async loginUser(login: LoginModel) {
    const user = await new db(Knex, db_connection)
      .getConnection()<IUser>("users")
      .select("*")
      .where({ email: login.email })
      .first();
    if (user) {
      if (AESEncryption.decrypt(user.password) === login.password) {
        return { ...user, success: true };
      }
      return {
        error: "Incorrect email address or password",
        success: false,
      };
    }
    return { error: "Incorrect email address or password", success: false };
  }

  public static resetPasswordSchema = {
    schema: {
      tags: ["Authentication"],
      body: {
        type: "object",
        additionalProperties: false,
        properties: {
          email: { type: "string" },
          oldPassword: { type: "string" },
          newPassword: { type: "string" },
        },
        required: ["email", "oldPassword", "newPassword"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
          },
        },
        "4xx": {
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  };
  public static async resetPassword(model: IResetPassword) {
    /** check if the user exists */
    const user = await new db(Knex, db_connection)
      .getConnection()("users")
      .select("*")
      .where({ email: model.email })
      .first();
    if (user) {
      /** try to login with the old password */
      if (user.password === AESEncryption.encrypt(model.oldPassword)) {
        /** on successful login change the password */
        var kn = new db(Knex, db_connection);
        var trx = await kn.startTransaction();
        try {
          var res = kn
            .getConnection()("user")
            .where({ email: model.email })
            .update({
              password: AESEncryption.encrypt(model.newPassword),
              updated_at: new Date(),
            });
          trx.commit();
          return res;
        } catch (error) {
          trx.rollback;
          throw error;
        }
      } else {
        throw new Error("Incorrect password");
      }
    }
    throw new Error("User does not exist");
  }

  private static async emailExists(email: string) {
    return new db(Knex, db_connection)
      .getConnection()("users")
      .select("email")
      .where({ email: email })
      .first();
  }
}
