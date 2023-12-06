import { QueryRunner } from "typeorm";
import { FromSchema } from "json-schema-to-ts";
import { createPillRoutineSchema } from "../schemas/pill_routine_schemas";
import { PillRoutine, PillRoutineStatus, PillRoutineStatusEvent, PillRoutineType, Profile } from "../models";
import { NotFoundPillRoutineType, NotFoundProfile, UnauthorizedError } from "../errors/custom_errors";
import { v4 as uuidv4 } from "uuid"
import RoutineFactory from "../utils/routine_factory";
import validateToken from "../utils/authorization_validator";
import { createModifiedPillSchema } from "../schemas/modified_pill_schemas";

export default class PillRoutineController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
    }

    public async getProfilePills(accountKey: string, profileKey: string, authorization: string){
        const token = await validateToken(authorization);
        if (token.sub! != accountKey){
            throw new UnauthorizedError()
        }

        // Pegar todas as pillRoutines desse perfil
        // Criar uma lista ordenada de routinePills

        // Pegar todas as modifiedPills desse perfil já ordenadas
        
        // Criar a lista de pills a partir das outras duas
    }
}
