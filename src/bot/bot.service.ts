import { Injectable } from "@nestjs/common";
import { Context, Markup } from "telegraf";
import { User } from "src/user/models/user.model";
import { InjectModel } from "@nestjs/sequelize";

@Injectable()
export class BotService {
  private readonly PAGE_SIZE = 10;

  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  mainMenuKeyboardForSaxiy() {
    return Markup.keyboard([
      ["✨ Muruvvat qilish", "🌙 Sabrlilarni ko'rish"],
      ["👨‍💼 Admin bilan bog'lanish", "🔧 Sozlamalar"],
    ]).resize();
  }

  mainMenuKeyboardForSabrli() {
    return Markup.keyboard([
      ["✨ Muruvvat so'rash", "☀️ Saxiylarni ko'rish"],
      ["👨‍💼 Admin bilan bog'lanish", "🔧 Sozlamalar"],
    ]).resize();
  }

  async start(ctx: Context) {
    const userId = ctx.from!.id;
    const user = await this.userModel.findByPk(userId!);
    if (!user) {
      await this.userModel.create({ id: userId });
      await this.userModel.update(
        { last_state: "role" },
        { where: { id: userId } }
      );
      await ctx.reply(
        "Muruvvat botiga xush kelibsiz! ✨\n\nIltimos, o'zingizga mos rolni tanlang:",
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "☀️ Saxiy", callback_data: "role_saxiy" },
                { text: "🌙 Sabrli", callback_data: "role_sabrli" },
              ],
            ],
          },
        }
      );
      return;
    } else if (user.last_state !== "finish") {
      await ctx.reply(
        "Muruvvat botiga xush kelibsiz! ✨\n\nIltimos, ro'yxatdan o'tishni davom ettiring",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Ro'yxatdan o'tish",
                  callback_data: "continue_register",
                },
              ],
            ],
          },
        }
      );
      return;
    }
    await ctx.reply(
      "Muruvvat botiga xush kelibsiz! ✨",
      user.role === "saxiy"
        ? this.mainMenuKeyboardForSaxiy()
        : this.mainMenuKeyboardForSabrli()
    );
  }

  async register(ctx: Context) {
    const userId = ctx.from!.id;
    const user = await this.userModel.findByPk(userId!);

    console.log(user);

    if (!user) {
      await ctx.reply("Avval /start tugmasini bosing");
      return;
    }

    if (user?.last_state === "finish") {
      await ctx.reply("Siz allaqachon ro'yxatdan o'tgansiz!");
      return;
    }

    const message: any = ctx.message;

    switch (user?.last_state) {
      case "role":
        await ctx.reply("Iltimos, rolni tanlang:", {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "☀️ Saxiy", callback_data: "role_saxiy" },
                { text: "🌙 Sabrli", callback_data: "role_sabrli" },
              ],
            ],
          },
        });
        break;

      case "name":
        if (message?.text) {
          await user?.update({
            name: message.text,
            last_state: "surname",
          });
          await ctx.reply("Familiyangizni kiriting:");
        } else {
          await ctx.reply("Ismingizni kiriting:");
        }
        break;

      case "surname":
        if (message?.text) {
          await user?.update({
            surname: message.text,
            last_state: "phone",
          });
          await ctx.reply("Telefon raqamingizni yuboring:", {
            reply_markup: {
              keyboard: [
                [
                  {
                    text: "📱 Telefon raqamni yuborish",
                    request_contact: true,
                  },
                ],
              ],
              resize_keyboard: true,
            },
          });
        } else {
          await ctx.reply("Familiyangizni kiriting:");
        }
        break;

      case "phone":
        if (message?.contact?.phone_number) {
          await user?.update({
            phone: message.contact.phone_number,
            last_state: "location",
          });
          await ctx.reply("Manzilingizni kiriting:", {
            ...Markup.keyboard([
              Markup.button.locationRequest("📍 Manzilni yuborish"),
            ]).resize(),
          });
        } else {
          await ctx.reply("Telefon raqamingizni yuboring:", {
            reply_markup: {
              keyboard: [
                [
                  {
                    text: "📱 Telefon raqamni yuborish",
                    request_contact: true,
                  },
                ],
              ],
              resize_keyboard: true,
            },
          });
        }
        break;

      case "location":
        if (message?.location) {
          const locationStr = `${message.location.latitude},${message.location.longitude}`;
          await user?.update({
            location: locationStr,
            last_state: "finish",
          });
          await ctx.reply(
            "Tabriklaymiz! Siz muvaffaqiyatli ro'yxatdan o'tdingiz! ✅",
            this.mainMenuKeyboardForSaxiy()
          );
        } else if (message?.text) {
          await user?.update({
            location: message.text,
            last_state: "finish",
          });
          await ctx.reply(
            "Tabriklaymiz! Siz muvaffaqiyatli ro'yxatdan o'tdingiz! ✅",
            this.mainMenuKeyboardForSaxiy()
          );
        } else {
          await ctx.reply("Manzilingizni kiriting:", {
            ...Markup.keyboard([
              Markup.button.locationRequest("📍 Manzilni yuborish"),
            ]).resize(),
          });
        }
        break;
    }
  }

  async roleSaxiy(ctx: Context) {
    const userId = ctx.from!.id;
    const user = await this.userModel.findByPk(userId!);

    if (!user) {
      await ctx.reply("Avval /start tugmasini bosing");
      return;
    }

    await ctx.answerCbQuery();
    await user?.update({
      role: "saxiy",
      last_state: "name",
    });
    await ctx.reply("Ismingizni kiriting:");
  }

  async roleSabrli(ctx: Context) {
    const userId = ctx.from!.id;
    const user = await this.userModel.findByPk(userId!);

    if (!user) {
      await ctx.reply("Avval /start tugmasini bosing");
      return;
    }

    await ctx.answerCbQuery();
    await user?.update({
      role: "sabrli",
      last_state: "name",
    });
    await ctx.reply("Ismingizni kiriting:");
  }

  async handleMessage(ctx: Context) {
    const userId = ctx.from!.id;
    const user = await this.userModel.findByPk(userId!);

    if (!user) {
      await ctx.reply("Avval /start tugmasini bosing");
      return;
    }

    const message: any = ctx.message;

    switch (user?.last_state) {
      case "role":
        await ctx.reply("Iltimos, rolni tanlang:", {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "☀️ Saxiy", callback_data: "role_saxiy" },
                { text: "🌙 Sabrli", callback_data: "role_sabrli" },
              ],
            ],
          },
        });
        break;

      case "name":
        if (message.text) {
          await user?.update({
            name: message.text,
            last_state: "surname",
          });
          await ctx.reply("Familiyangizni kiriting:");
        }
        break;

      case "surname":
        if (message.text) {
          await user?.update({
            surname: message.text,
            last_state: "phone",
          });
          await ctx.reply("Telefon raqamingizni yuboring:", {
            reply_markup: {
              keyboard: [
                [
                  {
                    text: "📱 Telefon raqamni yuborish",
                    request_contact: true,
                  },
                ],
              ],
              resize_keyboard: true,
            },
          });
        }
        break;

      case "phone":
        if (message.contact?.phone_number) {
          await user?.update({
            phone: message.contact.phone_number,
            last_state: "location",
          });
          await ctx.reply("Manzilingizni kiriting:", {
            ...Markup.keyboard([
              Markup.button.locationRequest("📍 Manzilni yuborish"),
            ]).resize(),
          });
        }
        break;

      case "location":
        if (message.location) {
          const locationStr = `${message.location.latitude},${message.location.longitude}`;
          await user?.update({
            location: locationStr,
            last_state: "finish",
          });
          await ctx.reply(
            "Tabriklaymiz! Siz muvaffaqiyatli ro'yxatdan o'tdingiz! ✅",
            this.mainMenuKeyboardForSaxiy()
          );
        } else if (message.text) {
          await user?.update({
            location: message.text,
            last_state: "finish",
          });
          await ctx.reply(
            "Tabriklaymiz! Siz muvaffaqiyatli ro'yxatdan o'tdingiz! ✅",
            this.mainMenuKeyboardForSaxiy()
          );
        } else {
          await ctx.reply(
            "Iltimos, manzilni text shaklida yoki lokatsiya shaklida yuboring:",
            {
              ...Markup.keyboard([
                Markup.button.locationRequest("📍 Manzilni yuborish"),
              ]).resize(),
            }
          );
        }
        break;
    }
  }

  async showSabrliUsers(ctx: Context, page = 1) {
    const offset = (page - 1) * this.PAGE_SIZE;

    const userId = ctx.from!.id;
    const user = await this.userModel.findByPk(userId!);

    if (!user) {
      await ctx.reply("Avval /start tugmasini bosing");
      return;
    }

    const totalUsers = await this.userModel.count({
      where: { role: "sabrli", last_state: "finish" },
    });

    const users = await this.userModel.findAll({
      where: { role: "sabrli" },
      limit: this.PAGE_SIZE,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    if (!users || users.length === 0) {
      await ctx.reply("Hozircha sabrli foydalanuvchilar yo'q");
      return;
    }

    const userList = users
      .map(
        (user, index) =>
          `${offset + index + 1}. ${user.name} ${user.surname} ${user.phone}`
      )
      .join("\n");

    const totalPages = Math.ceil(totalUsers / this.PAGE_SIZE);

    const buttons: any[] = [];
    if (page > 1) {
      buttons.push({
        text: "⬅️ Oldingi",
        callback_data: `sabrli_page_${page - 1}`,
      });
    }
    if (page < totalPages) {
      buttons.push({
        text: "Keyingi ➡️",
        callback_data: `sabrli_page_${page + 1}`,
      });
    }

    const keyboard = buttons.length > 0 ? [buttons] : [];

    await ctx.reply(
      `🌙 Sabrli foydalanuvchilar (${page}/${totalPages}):\n\n${userList}`,
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );
  }

  async handleSabrliPagination(ctx: Context) {
    const userId = ctx.from!.id;
    const user = await this.userModel.findByPk(userId!);

    if (!user) {
      await ctx.reply("Avval /start tugmasini bosing");
      return;
    }

    const callbackQuery: any = ctx.callbackQuery;
    const match = callbackQuery.data.match(/sabrli_page_(\d+)/);
    if (!match) return;

    const page = parseInt(match[1]);
    await ctx.answerCbQuery();

    await ctx.deleteMessage();

    return this.showSabrliUsers(ctx, page);
  }

  async showSaxiyUsers(ctx: Context, page = 1) {
    const offset = (page - 1) * this.PAGE_SIZE;

    const userId = ctx.from!.id;
    const user = await this.userModel.findByPk(userId!);

    if (!user) {
      await ctx.reply("Avval /start tugmasini bosing");
      return;
    }

    const totalUsers = await this.userModel.count({
      where: { role: "saxiy", last_state: "finish" },
    });

    const users = await this.userModel.findAll({
      where: { role: "saxiy", last_state: "finish" },
      limit: this.PAGE_SIZE,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    if (!users || users.length === 0) {
      await ctx.reply("Hozircha saxiy foydalanuvchilar yo'q");
      return;
    }

    const userList = users
      .map(
        (user, index) =>
          `${offset + index + 1}. ${user.name} ${user.surname} ${user.phone}`
      )
      .join("\n");

    const totalPages = Math.ceil(totalUsers / this.PAGE_SIZE);

    const buttons: any[] = [];
    if (page > 1) {
      buttons.push({
        text: "⬅️ Oldingi",
        callback_data: `saxiy_page_${page - 1}`,
      });
    }
    if (page < totalPages) {
      buttons.push({
        text: "Keyingi ➡️",
        callback_data: `saxiy_page_${page + 1}`,
      });
    }

    const keyboard = buttons.length > 0 ? [buttons] : [];

    await ctx.reply(
      `☀️ Saxiy foydalanuvchilar (${page}/${totalPages}):\n\n${userList}`,
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );
  }

  async handleSaxiyPagination(ctx: Context) {
    const userId = ctx.from!.id;
    const user = await this.userModel.findByPk(userId!);

    if (!user) {
      await ctx.reply("Avval /start tugmasini bosing");
      return;
    }

    const callbackQuery: any = ctx.callbackQuery;
    const match = callbackQuery.data.match(/saxiy_page_(\d+)/);
    if (!match) return;

    const page = parseInt(match[1]);
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
    return this.showSaxiyUsers(ctx, page);
  }
}
