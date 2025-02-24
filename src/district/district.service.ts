import { Injectable } from "@nestjs/common";
import { District } from "./models/district.model";
import { InjectModel } from "@nestjs/sequelize";
import { CreateDistrictDto } from "./dto/create-district.dto";
import { UpdateDistrictDto } from "./dto/update-district.dto";

@Injectable()
export class DistrictService {
  constructor(
    @InjectModel(District) private readonly districtModel: typeof District
  ) {}

  create(createDistrictDto: CreateDistrictDto) {
    return this.districtModel.create(createDistrictDto);
  }

  findAll() {
    return this.districtModel.findAll();
  }

  findOne(id: number) {
    return this.districtModel.findOne({ where: { id } });
  }

  update(id: number, updateDistrictDto: UpdateDistrictDto) {
    return this.districtModel.update(updateDistrictDto, { where: { id } });
  }

  remove(id: number) {
    return this.districtModel.destroy({ where: { id } });
  }
}
