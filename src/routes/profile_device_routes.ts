import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { createProfileDeviceSchema } from '../schemas/profile_device_schemas';
import ProfileDeviceController from '../controllers/profile_device_controller';

export async function profileDeviceRoutes(server: FastifyInstance){
    server.post<{
        Params: FromSchema<typeof createProfileDeviceSchema.params>,
        Body: FromSchema<typeof createProfileDeviceSchema.body>
    }>(
        "/account/:accountKey/profile/:profileKey/profile_device",
        {
            schema: createProfileDeviceSchema
        },
        async (req, resp)=>{
            const profileDeviceController = new ProfileDeviceController(req.transaction);
            const { accountKey, profileKey } = req.params;
            await profileDeviceController.createProfileDevice(accountKey, profileKey, req.body)

            resp.status(201).send({})
    }); 
}
