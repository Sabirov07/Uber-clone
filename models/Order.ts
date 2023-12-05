import mongoose, {Schema, Document} from "mongoose";

export interface OrderDoc extends Document{
    orderID: string,
    vandorID: string,
    items: [any],
    totalAmount: number,
    paidAmount: number,
    orderDate: Date,
    orderStatus: string, //waiting / failed/ accepted / rejected/ under-process/ ready
    remarks: string,
    deliveryId: string,
    readyTime: number,
}

const OrderSchema = new Schema({
    orderID: { type: String, required: true },
    vandorID: {type: String, required: true},
    items: [
        {
            food: { type: Schema.Types.ObjectId, ref: 'food', required: true},
            unit: { type: Number, required: true}
        }
    ],
    totalAmount: { type: Number, required: true},
    paidAmount: { type: Number, required: true},
    orderDate: { type: Date},
    orderStatus: { type: String},
    remarks: { type: String},
    deliveryId: { type: String},
    readyTime: { type: Number}
}, {
    toJSON: {
        transform(doc, ret){
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps: true
})

const Order = mongoose.model<OrderDoc>('order', OrderSchema);

export {Order};