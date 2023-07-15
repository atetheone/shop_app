import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Customer {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    lastAdress: string;

}

export const CustomerSchema = SchemaFactory.createForClass(Customer);