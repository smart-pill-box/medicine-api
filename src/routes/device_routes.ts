import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { createDeviceSchema, getDeviceSchema, updateDeviceIpSchema, putDevicePoolingSchema } from '../schemas/device_schemas';
import DeviceController from '../controllers/device_controller';
import { DeviceDto } from '../dtos/device_dto';
import { Device } from '../models';

export async function deviceRoutes(server: FastifyInstance) {
	server.get<{ Params: FromSchema<typeof getDeviceSchema.params> }>(
		"/device/:deviceKey",
		{
			schema: getDeviceSchema
		},
		async (req, resp) => {
			const deviceController = new DeviceController(req.transaction);

			const device = await deviceController.getDevice(req.params.deviceKey);

			resp.status(200).send(DeviceDto.toClientResponse(device));
		})

	server.post<{ Body: FromSchema<typeof createDeviceSchema.body> }>(
		"/device",
		{
			schema: createDeviceSchema
		},
		async (req, resp) => {
			const deviceController = new DeviceController(req.transaction);

			const device = await deviceController.createDevice(req.body);

			resp.status(201).send(DeviceDto.toClientResponse(device));
		});

	server.put<{
		Params: FromSchema<typeof getDeviceSchema.params>
		Body: FromSchema<typeof updateDeviceIpSchema.body>
	}>(
		"/device/:deviceKey/device_ip",
		{
			schema: updateDeviceIpSchema
		},
		async (req, resp) => {
			const deviceController = new DeviceController(req.transaction);
			const device = await deviceController.updateIp(req.params.deviceKey, req.body);

			resp.status(201).send(DeviceDto.toClientResponse(device));
		});

	server.put<{
		Params: FromSchema<typeof putDevicePoolingSchema.params>
	}>(
		"/device/:deviceKey/pooling",
		{
			schema: putDevicePoolingSchema
		},
		async (req, resp) => {
			const deviceController = new DeviceController(req.transaction);
			const device = await deviceController.pooling(req.params.deviceKey)
		}
	)
}
