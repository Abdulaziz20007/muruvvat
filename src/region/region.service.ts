import { Injectable } from "@nestjs/common";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import { Region } from "./models/region.model";
import { InjectModel } from "@nestjs/sequelize";

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(Region) private readonly regionModel: typeof Region
  ) {}

  create(createRegionDto: CreateRegionDto) {
    return this.regionModel.create(createRegionDto);
  }

  findAll() {
    return this.regionModel.findAll();
  }

  findOne(id: number) {
    return this.regionModel.findOne({ where: { id } });
  }

  update(id: number, updateRegionDto: UpdateRegionDto) {
    return this.regionModel.update(updateRegionDto, { where: { id } });
  }

  remove(id: number) {
    return this.regionModel.destroy({ where: { id } });
  }
}
