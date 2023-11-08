import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { getProfileParamsSchema, createProfileBodySchema, createProfileParamsSchema } from '../schemas/profile_schemas';
import ProfileController from '../controllers/profile_controller';
import { ProfileDto } from '../dtos/profile_dto';

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
