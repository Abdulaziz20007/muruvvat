import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { District } from "../../district/models/district.model";

interface RegionCreationAttr {
  name: string;
}

@Table({ tableName: "regions" })
export class Region extends Model<Region, RegionCreationAttr> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @HasMany(() => District)
  districts: District[];
}
