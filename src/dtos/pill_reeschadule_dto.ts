import { PillReeschadule } from "../models";
import { ModifiedPillDto } from "./modified_pill_dto";

export class PillReeschaduleDto {
    static toClientResponse(pillReeschadule: PillReeschadule) {

        return {
            reeschaduledPill: ModifiedPillDto.toClientResponse(pillReeschadule.reeschaduledPill),
            newPill: ModifiedPillDto.toClientResponse(pillReeschadule.newPill)
        };
    }
}
