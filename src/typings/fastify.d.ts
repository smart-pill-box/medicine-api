import { QueryRunner } from 'typeorm';
import FastifyRequest from "fastify";

declare module 'fastify' {
  export interface FastifyRequest {
    transaction: QueryRunner; // Replace YourTransactionType with the type of your database transaction object
  }
}