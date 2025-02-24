import { Update, Ctx, Start, Action, On, Hears } from "nestjs-telegraf";
import { Context } from "telegraf";
import { BotService } from "./bot.service";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    return this.botService.start(ctx);
  }

  @Action("continue_register")
  async continueRegister(@Ctx() ctx: Context) {
    return this.botService.register(ctx);
  }

  @Action("location")
  async location(@Ctx() ctx: Context) {
    return this.botService.register(ctx);
  }

  @Action("role_saxiy")
  async roleSaxiy(@Ctx() ctx: Context) {
    return this.botService.roleSaxiy(ctx);
  }

  @Action("role_sabrli")
  async roleSabrli(@Ctx() ctx: Context) {
    return this.botService.roleSabrli(ctx);
  }

  @Hears("🌙 Sabrlilarni ko'rish")
  async onText(@Ctx() ctx: Context) {
    return this.botService.showSabrliUsers(ctx);
  }

  @Action(/sabrli_page_\d+/)
  async handleSabrliPagination(@Ctx() ctx: Context) {
    return this.botService.handleSabrliPagination(ctx);
  }

  @Hears("🌙 Saxiylarni ko'rish")
  async showSaxiyUsers(@Ctx() ctx: Context) {
    return this.botService.showSaxiyUsers(ctx);
  }

  @Action(/saxiy_page_\d+/)
  async handleSaxiyPagination(@Ctx() ctx: Context) {
    return this.botService.handleSaxiyPagination(ctx);
  }

  @On("message")
  async handleMessage(@Ctx() ctx: Context) {
    return this.botService.handleMessage(ctx);
  }
}
