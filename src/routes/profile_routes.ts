import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { getProfileParamsSchema, createProfileBodySchema, createProfileParamsSchema, getProfileDevicesParamsSchema } from '../schemas/profile_schemas';
import ProfileController from '../controllers/profile_controller';
import { ProfileDto } from '../dtos/profile_dto';
import { DeviceDto } from '../dtos/device_dto';

export async function profileRoutes(server: FastifyInstance){
    server.get<{ Params: FromSchema<typeof getProfileParamsSchema> }>(
        "/account/:accountKey/profile/:profileKey",
        {
            schema: {
                params: getProfileParamsSchema
            }
        },
        async (req, resp)=>{
            const profileController = new ProfileController(req.transaction)

            const profile = await profileController.getProfile(req.params.accountKey, req.params.profileKey);

            resp.status(200).send(
                ProfileDto.toClientResponse(profile)
            );
        })

    server.get<{ Params: FromSchema<typeof getProfileDevicesParamsSchema> }>(
        "/account/:accountKey/profile/:profileKey/profile_devices",
        {
            schema: {
                params: getProfileDevicesParamsSchema
            }
        },
        async (req, resp)=>{
            const profileController = new ProfileController(req.transaction);

            const profileDevices = await profileController.getAllProfileDevices(
                req.params.accountKey, req.params.profileKey
            );

            resp.status(200).send(
                {
                    isLastPage: true,
                    page: 0,
                    limit: 9999,
                    data: profileDevices.map((device)=>{return DeviceDto.toClientResponse(device)})
                }
            );
        }
    )

    server.post<{
        Params: FromSchema<typeof createProfileParamsSchema>,
        Body: FromSchema<typeof createProfileBodySchema>
    }>(
        "/account/:accountKey/profile",
        {
            schema: {
                body: createProfileBodySchema,
                params: createProfileParamsSchema
            }
        },
        async (req, resp)=>{
            const profileController = new ProfileController(req.transaction)

            const profile = await profileController.createProfile(req.params.accountKey, req.body);

            resp.status(201).send(
                ProfileDto.toClientResponse(profile)
            );
    }); 
}
