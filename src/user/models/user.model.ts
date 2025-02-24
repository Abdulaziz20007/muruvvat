import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { District } from "src/district/models/district.model";
import { Region } from "src/region/models/region.model";

interface UserCreationAttr {
  id: number;
}

@Table({ tableName: "users" })
export class User extends Model<User, UserCreationAttr> {
  @Column({ type: DataType.BIGINT, primaryKey: true, unique: true })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.STRING })
  surname: string;

  @Column({ type: DataType.STRING })
  phone: string;

  @Column({ type: DataType.STRING })
  location: string;

  @Column({ type: DataType.STRING })
  role: string;

  @ForeignKey(() => District)
  @Column({ type: DataType.INTEGER })
  district_id: number;

  @ForeignKey(() => Region)
  @Column({ type: DataType.INTEGER })
  region_id: number;

  @Column({ type: DataType.STRING })
  last_state: string;

  @BelongsTo(() => District)
  district: District;

  @BelongsTo(() => Region)
  region: Region;
}
