import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { createModifiedPillSchema } from '../schemas/modified_pill_schemas';
import PillRoutineController from '../controllers/pill_routine_controller';
import { PillRoutineDto } from '../dtos/pill_routine_dto';
import ModifiedPillController from '../controllers/modified_pill_controller';
import { ModifiedPillDto } from '../dtos/modified_pill_dto';

export async function modifiedPillRoutes(server: FastifyInstance){
    server.post<{ 
        Params: FromSchema<typeof createModifiedPillSchema.params>,
        Body: FromSchema<typeof createModifiedPillSchema.body>,
        Headers: FromSchema<typeof createModifiedPillSchema.headers>,
    }>(
        "/account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/modified_pill",
        {
            schema: createModifiedPillSchema
        },
        async (req, resp)=>{
            const modifiedPillController = new ModifiedPillController(req.transaction);

            const modifiedPill = await modifiedPillController.createModifiedPill(
                req.params.accountKey, 
                req.params.profileKey,
                req.params.pillRoutineKey,
                req.body,
                req.headers.authorization
            );

            resp.status(201).send(ModifiedPillDto.toClientResponse(modifiedPill));
        })
}
