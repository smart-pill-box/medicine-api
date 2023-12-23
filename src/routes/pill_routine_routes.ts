import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { createPillRoutineSchema, getPillRoutineModifiedPills, getPillRoutineSchema, updatePillRoutineSchema } from '../schemas/pill_routine_schemas';
import PillRoutineController from '../controllers/pill_routine_controller';
import { PillRoutineDto } from '../dtos/pill_routine_dto';
import { ModifiedPill } from '../models';
import { ModifiedPillDto } from '../dtos/modified_pill_dto';
import { updatePillStatusSchema } from '../schemas/pill_schemas';

export async function pillRoutineRoutes(server: FastifyInstance){
    server.post<{ 
        Params: FromSchema<typeof createPillRoutineSchema.params>,
        Body: FromSchema<typeof createPillRoutineSchema.body>,
        Headers: FromSchema<typeof createPillRoutineSchema.headers>,
    }>(
        "/account/:accountKey/profile/:profileKey/pill_routine",
        {
            schema: createPillRoutineSchema
        },
        async (req, resp)=>{
            const pillRoutineController = new PillRoutineController(req.transaction);

            const { accountKey, profileKey } = req.params;
            const pillRoutine = await pillRoutineController.createPillRoutine(accountKey, profileKey, req.body, req.headers.authorization);

            resp.status(201).send(PillRoutineDto.toClientResponse(pillRoutine))
        }
    );

    server.get<{
        Params: FromSchema<typeof getPillRoutineSchema.params>,
        Headers: FromSchema<typeof getPillRoutineSchema.headers>
    }>(
        "/account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey",
        {
            schema: getPillRoutineSchema
        },
        async (req, resp)=>{
            const pillRoutineController = new PillRoutineController(req.transaction);

            const { accountKey, profileKey, pillRoutineKey } = req.params;
            const pillRoutine = await pillRoutineController.getPillRoutine(accountKey, profileKey, pillRoutineKey, req.headers.authorization);

            resp.status(200).send(PillRoutineDto.toClientResponse(pillRoutine))
        }
    );

    server.get<{
        Params: FromSchema<typeof getPillRoutineModifiedPills.params>,
        Headers: FromSchema<typeof getPillRoutineModifiedPills.headers>
    }>(
        "/account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/modified_pills",
        {
            schema: getPillRoutineModifiedPills
        },
        async (req, resp)=>{
            const pillRoutineController = new PillRoutineController(req.transaction);

            const { accountKey, profileKey, pillRoutineKey } = req.params;
            const modifiedPills = await pillRoutineController.getPillRoutineModifiedPills(accountKey, profileKey, pillRoutineKey, req.headers.authorization);

            const data = modifiedPills.map(modifiedPill=>ModifiedPillDto.toClientResponse(modifiedPill));

            resp.status(200).send({
                isLastPage: true,
                page: 0,
                limit: 99999,
                data: data
            })
        }
    );

    server.put<{ 
        Params: FromSchema<typeof updatePillRoutineSchema.params>,
        Body: FromSchema<typeof updatePillRoutineSchema.body>,
        Headers: FromSchema<typeof updatePillRoutineSchema.headers>,
    }>(
        "/account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey",
        {
            schema: updatePillRoutineSchema
        },
        async (req, resp)=>{
            const pillRoutineController = new PillRoutineController(req.transaction);

            const { accountKey, profileKey, pillRoutineKey } = req.params;
            const newPillRoutine = await pillRoutineController.updatePillRoutine(accountKey, profileKey, pillRoutineKey, req.body, req.headers.authorization);

            resp.status(201).send(PillRoutineDto.toClientResponse(newPillRoutine))
        }
    );

    server.put<{ 
        Params: FromSchema<typeof updatePillStatusSchema.params>,
        Body: FromSchema<typeof updatePillStatusSchema.body>,
        Headers: FromSchema<typeof updatePillStatusSchema.headers>,
    }>(
        "/account/:accountKey/profile/:profileKey/pill_routine/:pillRoutineKey/status",
        {
            schema: updatePillStatusSchema
        },
        async (req, resp)=>{
            const pillRoutineController = new PillRoutineController(req.transaction);

            const { accountKey, profileKey, pillRoutineKey } = req.params;
            const pillRoutine = await pillRoutineController.updatePillRoutineStatus(accountKey, profileKey, pillRoutineKey, req.body, req.headers.authorization);

            resp.status(201).send(PillRoutineDto.toClientResponse(pillRoutine))
        }
    );
}
