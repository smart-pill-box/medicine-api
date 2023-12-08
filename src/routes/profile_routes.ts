import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { createProfileSchema, getProfileSchema, getProfileDevicesSchema, getProfilePillRoutinesSchema, getProfilePillsSchema } from '../schemas/profile_schemas';
import ProfileController from '../controllers/profile_controller';
import { ProfileDto } from '../dtos/profile_dto';
import { DeviceDto } from '../dtos/device_dto';
import { PillRoutineDto } from '../dtos/pill_routine_dto';
import { PillDto } from '../dtos/pill_dto';

export async function profileRoutes(server: FastifyInstance){
    server.get<{ 
        Params: FromSchema<typeof getProfileSchema.params>, 
        Headers: FromSchema<typeof getProfileSchema.headers>
    }>(
        "/account/:accountKey/profile/:profileKey",
        {
            schema: getProfileSchema
        },
        async (req, resp)=>{
            const profileController = new ProfileController(req.transaction)

            const profile = await profileController.getProfile(
                req.params.accountKey, req.params.profileKey, req.headers.authorization);

            resp.status(200).send(
                ProfileDto.toClientResponse(profile)
            );
        })

    server.get<{ 
        Params: FromSchema<typeof getProfileDevicesSchema.params>, 
        Headers: FromSchema<typeof getProfileDevicesSchema.headers>
    }>(
        "/account/:accountKey/profile/:profileKey/profile_devices",
        {
            schema: getProfileDevicesSchema
        },
        async (req, resp)=>{
            const profileController = new ProfileController(req.transaction);

            const profileDevices = await profileController.getAllProfileDevices(
                req.params.accountKey, req.params.profileKey, req.headers.authorization
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

    server.get<{ 
        Params: FromSchema<typeof getProfilePillRoutinesSchema.params>, 
        Headers: FromSchema<typeof getProfilePillRoutinesSchema.headers>
    }>(
        "/account/:accountKey/profile/:profileKey/pill_routines",
        {
            schema: getProfilePillRoutinesSchema
        },
        async (req, resp)=>{
            const profileController = new ProfileController(req.transaction);

            const profilePillRoutines = await profileController.getAllProfilePillRoutines(
                req.params.accountKey, req.params.profileKey, req.headers.authorization
            );

            resp.status(200).send(
                {
                    isLastPage: true,
                    page: 0,
                    limit: 9999,
                    data: profilePillRoutines.map((pillRoutine)=>{return PillRoutineDto.toClientResponse(pillRoutine)})
                }
            );
        }
    )


    server.post<{
        Params: FromSchema<typeof createProfileSchema.params>,
        Body: FromSchema<typeof createProfileSchema.body>,
        Headers: FromSchema<typeof createProfileSchema.headers>
    }>(
        "/account/:accountKey/profile",
        {
            schema: createProfileSchema
        },
        async (req, resp)=>{
            const profileController = new ProfileController(req.transaction)

            const profile = await profileController.createProfile(
                req.params.accountKey, req.body, req.headers.authorization
            );

            resp.status(201).send(
                ProfileDto.toClientResponse(profile)
            );
    });

    server.get<{
        Params: FromSchema<typeof getProfilePillsSchema.params>,
        Querystring: FromSchema<typeof getProfilePillsSchema.querystring>,
        Headers: FromSchema<typeof getProfilePillsSchema.headers>
    }>(
        "/account/:accountKey/profile/:profileKey/pills",
        {
            schema: getProfilePillsSchema
        },
        async (req, resp)=>{
            const profileController = new ProfileController(req.transaction)

            const { accountKey, profileKey } = req.params;
            const pills = await profileController.getProfilePills(accountKey, profileKey, req.query, req.headers.authorization)

            const data = pills.map(pill => PillDto.toClientResponse(pill));

            resp.status(200).send({
                isLastPage: true,
                page: 0,
                limit: 99999,
                data: data
            });
    }); 
    
}
