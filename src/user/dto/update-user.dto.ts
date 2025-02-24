import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  name?: string;
  surname?: string;
  phone?: string;
  location?: string;
  district_id?: number;
  region_id?: number;
}
