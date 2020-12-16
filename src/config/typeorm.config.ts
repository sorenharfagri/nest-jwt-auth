import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeormConfig: TypeOrmModuleOptions = {
    type: 'mongodb',
    name: 'default',
    host: 'localhost',
    port: 27017,
    database: 'nest-jwt',
    useNewUrlParser: true,
    autoLoadEntities: true,
    useUnifiedTopology: true,
    synchronize: true,
    entities: [__dirname + '/../**/*.entity.js'],
}