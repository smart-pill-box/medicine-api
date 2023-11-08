import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { createDeviceBodySchema, getDeviceParamsSchema } from '../schemas/device_schemas';
import DeviceController from '../controllers/device_controller';
import { DeviceDto } from '../dtos/device_dto';

export async function deviceRoutes(server: FastifyInstance){
    server.get<{ Params: FromSchema<typeof getDeviceParamsSchema> }>(
        "/device/:deviceKey",
        {
            schema: {
                params: getDeviceParamsSchema
            }
        },
        async (req, resp)=>{
            const deviceController = new DeviceController(req.transaction);

            const device = await deviceController.getDevice(req.params.deviceKey);

            resp.status(200).send(DeviceDto.toClientResponse(device));
        })

    server.post<{ Body: FromSchema<typeof createDeviceBodySchema> }>(
        "/device",
        {
            schema: {
                body: createDeviceBodySchema
            }
        },
        async (req, resp)=>{
            const deviceController = new DeviceController(req.transaction);

            const device = await deviceController.createdevice(req.body);

            resp.status(201).send(DeviceDto.toClientResponse(device));
    }); 
}
