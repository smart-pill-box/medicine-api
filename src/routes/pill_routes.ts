import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import PillRoutineController from '../controllers/pill_routine_controller';
import { PillRoutineDto } from '../dtos/pill_routine_dto';
import { ModifiedPillDto } from '../dtos/modified_pill_dto';
import { updatePillStatusSchema, createResschadulePillSchema, getPillReeschaduleSchema } from '../schemas/pill_schemas';
import PillController from '../controllers/pill_controller';
import { PillReeschaduleDto } from '../dtos/pill_reeschadule_dto';

export async function pillRoutes(server: FastifyInstance){
    server.put<{ 
        Params: FromSchema<typeof updatePillStatusSchema.params>,
        Body: FromSchema<typeof updatePillStatusSchema.body>,
        Headers: FromSchema<typeof updatePillStatusSchema.headers>,
    }>(
        "/account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/pill/:pillDatetime/status",
        {
            schema: updatePillStatusSchema
        },
        async (req, resp)=>{
            const pillController = new PillController(req.transaction);

            const modifiedPill = await pillController.updatePillStatus(
                req.params.accountKey, 
                req.params.profileKey,
                req.params.pillRoutineKey,
                req.params.pillDatetime,
                req.body,
                req.headers.authorization
            );

            resp.status(201).send(ModifiedPillDto.toClientResponse(modifiedPill));
        })

    server.post<{ 
        Params: FromSchema<typeof createResschadulePillSchema.params>,
        Body: FromSchema<typeof createResschadulePillSchema.body>,
        Headers: FromSchema<typeof createResschadulePillSchema.headers>,
    }>(
        "/account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/pill/:pillDatetime/reeschadule",
        {
            schema: createResschadulePillSchema
        },
        async (req, resp)=>{
            const pillController = new PillController(req.transaction);

            const pillReeschadule = await pillController.reeschadulePill(
                req.params.accountKey, 
                req.params.profileKey,
                req.params.pillRoutineKey,
                req.params.pillDatetime,
                req.body,
                req.headers.authorization
            );

            resp.status(201).send(PillReeschaduleDto.toClientResponse(pillReeschadule));
        })

        server.get<{ 
            Params: FromSchema<typeof getPillReeschaduleSchema.params>,
            Headers: FromSchema<typeof getPillReeschaduleSchema.headers>,
        }>(
            "/account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/pill/:pillDatetime/reeschadule",
            {
                schema: getPillReeschaduleSchema
            },
            async (req, resp)=>{
                const pillController = new PillController(req.transaction);
    
                const pillReeschadule = await pillController.getPillReeschadule(
                    req.params.accountKey, 
                    req.params.profileKey,
                    req.params.pillRoutineKey,
                    req.params.pillDatetime,
                    req.headers.authorization
                );
    
                resp.status(200).send(PillReeschaduleDto.toClientResponse(pillReeschadule));
            })
}
