import { Module } from "@nestjs/common";
import { BotModule } from "./bot/bot.module";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./user/models/user.model";
import { TelegrafModule } from "nestjs-telegraf";
import { RegionModule } from "./region/region.module";
import { DistrictModule } from "./district/district.module";
import { District } from "./district/models/district.model";
import { Region } from "./region/models/region.model";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN || "",
      botName: process.env.BOT_NAME || "Muruvvat",
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      models: [User, District, Region],
      autoLoadModels: true,
      sync: { alter: true },
      logging: false,
    }),
    BotModule,
    RegionModule,
    DistrictModule,
    UserModule,
  ],
})
export class AppModule {}
