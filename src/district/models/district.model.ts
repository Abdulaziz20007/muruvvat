import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Region } from "../../region/models/region.model";

interface DistrictCreationAttr {
  name: string;
  region_id: number;
}

@Table({ tableName: "districts" })
export class District extends Model<District, DistrictCreationAttr> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ForeignKey(() => Region)
  @Column({ type: DataType.INTEGER })
  region_id: number;

  @BelongsTo(() => Region)
  region: Region;
}
