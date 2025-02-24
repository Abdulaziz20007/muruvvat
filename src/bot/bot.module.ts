import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "src/user/models/user.model";

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [BotUpdate, BotService],
  exports: [BotService],
})
export class BotModule {}
