
import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { createDevicePillSchema, getDevicePillsSchema} from '../schemas/device_pill_schemas';
import DevicePillController from '../controllers/device_pill_controller';
import { DevicePillDto } from '../dtos/device_pill_dto';

export async function devicePillRoutes(server: FastifyInstance){
    server.post<{ 
        Params: FromSchema<typeof createDevicePillSchema.params>,
        Body: FromSchema<typeof createDevicePillSchema.body>,
    }>(
        "/device/:deviceKey/device_pill",
        {
            schema: createDevicePillSchema
        },
        async (req, resp)=>{
            const devicePillController = new DevicePillController(req.transaction);

			const devicePill = await devicePillController.createDevicePill(
				req.params.deviceKey,
				req.body
			);
            resp.status(201).send(DevicePillDto.toClientResponse(devicePill));
        }
	)

    server.get<{ 
        Params: FromSchema<typeof getDevicePillsSchema.params>,
    }>(
        "/device/:deviceKey/device_pills",
        {
            schema: getDevicePillsSchema
        },
        async (req, resp)=>{
            const devicePillController = new DevicePillController(req.transaction);

			const devicePills = await devicePillController.getDevicePills(
					req.params.deviceKey
			)

			const response = {
					limit: 9999,
					offset: 0,
					isLastPage: true,
					data: devicePills.map(devicePill => {
							return DevicePillDto.toClientResponse(devicePill);
					})
			}
            resp.status(201).send(response);
        })
}
