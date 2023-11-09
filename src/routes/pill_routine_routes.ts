import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { createPillRoutineSchema } from '../schemas/pill_routine_schemas';
import PillRoutineController from '../controllers/pill_routine_controller';

export async function pillRoutineRoutes(server: FastifyInstance){
    server.post<{ 
        Params: FromSchema<typeof createPillRoutineSchema.params>,
        Body: FromSchema<typeof createPillRoutineSchema.body>
    }>(
        "/account/:accountKey/profile/:profileKey/pill_routine",
        {
            schema: createPillRoutineSchema
        },
        async (req, resp)=>{
            const pillRoutineController = new PillRoutineController(req.transaction);

            const { accountKey, profileKey } = req.params;
            const pillRoutine = await pillRoutineController.createPillRoutine(accountKey, profileKey, req.body);
        })
}
