import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { createProfileDeviceBodySchema, createProfileDeviceParamsSchema } from '../schemas/profile_device_schemas';
import ProfileDeviceController from '../controllers/profile_device_controller';

export async function profileDeviceRoutes(server: FastifyInstance){
    server.post<{
        Params: FromSchema<typeof createProfileDeviceParamsSchema>,
        Body: FromSchema<typeof createProfileDeviceBodySchema>
    }>(
        "/account/:accountKey/profile/:profileKey/profile_device",
        {
            schema: {
                body: createProfileDeviceBodySchema,
                params: createProfileDeviceParamsSchema
            }
        },
        async (req, resp)=>{
            const profileDeviceController = new ProfileDeviceController(req.transaction);
            const { accountKey, profileKey } = req.params;
            await profileDeviceController.createProfileDevice(accountKey, profileKey, req.body)

            resp.status(201).send({})
    }); 
}
