import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BuildEvent } from './build-event.schema';
import { Model } from 'mongoose';
import { MSProduct } from './product.schema';
import { Order } from './order.schema';
import { Customer } from './customer.schema';
import { SetPriceDto } from 'src/common/SetPriceDto';
import { PlaceOrderDto } from 'src/common/PlaceOrderDto';
import { HttpService } from '@nestjs/axios';
import Subscription from './Subscription';

@Injectable()
export class BuilderService implements OnModuleInit {
  
    subscriberUrls: string[] = [];

    constructor(
      private httpService: HttpService,
      @InjectModel('eventStore') private buildEventModel: Model<BuildEvent>,
      @InjectModel('products') private productsModel: Model<MSProduct>,
      @InjectModel('orders') private ordersModel: Model<Order>,
      @InjectModel('customers') private customersModel: Model<Customer>
    ) {
  
    }


    onModuleInit() { 
      // await this.reset();
    }

    async handleProductStored(event: BuildEvent) {
      let newProduct = null;
      
      const storeSuccess = await this.storeEvent(event);
        
      if (storeSuccess) {
        //const newAmount = await this.computeNewProductAmount(event.payload.product);

        const productPatch = {
          product: event.payload.product,
          amount: event.payload.amount,
          amountTime: event.time
        };

        newProduct = await this.storeProduct(productPatch);
      } else {
        newProduct = await this.productsModel.findOne({ product: event.blockId });
      }
      
      return newProduct;
    }

    async storeProduct(productData: any) {
      try {
        const newProduct = await this.productsModel.findOneAndUpdate(
          {product: productData.product},
          // set the amount time to the new amount time
          productData,
          {upsert: true, new: true}
        ).exec();
        console.log(`BuilderService.storeProduct findOneAndUpdate:\n${JSON.stringify(newProduct, null, 3)}`);
        return newProduct;

      } catch (e) {
        console.error(`error in BuilderService.storeProduct:\n${JSON.stringify(e, null, 3)}`);

      }

    }

    async storeEvent(event: BuildEvent) {
      const filter =  { blockId: event.blockId };
      // ensure at least a placholder
      const placeholder = await this.buildEventModel.findOneAndUpdate(
        filter,
        { blockId: event.blockId, $setOnInsert: { time: '' } },
        { upsert: true, new:true }
      ).exec();
      console.log(`BuilderService.storeEvent line 50: \n${JSON.stringify(placeholder, null, 3)}`);
      
      const newEvent = await this.buildEventModel.findOneAndUpdate(
        { blockId: event.blockId, time: { $lt: event.time } },
        event,
        { new:true }
      ).exec();
      console.log(`BuilderService.storeEvent line 58: \n${JSON.stringify(newEvent, null, 3)}`);

      
      return newEvent != null;
 
    }
  
    async reset() {
      await this.clear();
    } 
    async clear() {
      await this.productsModel.deleteMany();
      await this.buildEventModel.deleteMany();
    }

    async computeNewProductAmount(productName) {
      // last product stored amount
      const lastStoredEvent = await this.buildEventModel.findOne({'payload.product': productName}).exec();
      const lastAmount = lastStoredEvent.payload.amount;

      // minus new orders
      const newOrdersList: any[] = await this.buildEventModel.find({
        eventType: 'placeOrder',
        'payload.product': productName
      }).exec();
 
      let t = lastAmount;
      for (let orderEvent of newOrdersList) {
        t -= orderEvent.payload.amount;
      }

      // console.log(`${newOrdersList} - ${lastAmount} + ' =? ' `);
      return t;
    }

    async handlePlaceOrder(event: BuildEvent) {
      let newOrder = null;
      
      const storeSuccess = await this.storeEvent(event);
        
      if (storeSuccess) {
        
        try {
          newOrder = await this.ordersModel.findOneAndUpdate(
            { code: event.payload.code },
            event.payload,
            { upsert: true, new: true }
          ).exec();
          console.log(`BuilderService.handlePlaceOrder line 130 : \n${JSON.stringify(newOrder, null, 3)}`);

          const newCustomer = await this.customersModel.findOneAndUpdate(
            { name: event.payload.customer },
            {
              name: event.payload.customer,
              lastAdress: event.payload.adress
            },
            { upsert: true, new: true }
          ).exec();
          console.log(`BuilderService.handlePlaceOrder line 130 : \n${JSON.stringify(newCustomer, null, 3)}`);

          const newAmount = this.computeNewProductAmount(event.payload.product);
          await this.productsModel.findOneAndUpdate(
            { product: event.payload.product },
            { amount: Number(newAmount) }
          );
          return newOrder;
        } catch (e) {
          console.log(`Error in BuilderService.placeOrder: \n${JSON.stringify(e, null, 3)}`);
        }
      } else {
        newOrder = await this.productsModel.findOne({product: event.payload.product})
      }
      
      return newOrder;
    }

    async handleAddOffer(event: BuildEvent) {
      let newProduct = null;
      
      const storeSuccess = await this.storeEvent(event);
        
      if (storeSuccess) {
        const productPatch = {
          product: event.payload.product,
          price: event.payload.price
        };
       // console.log(`BuilderService.handleAddOffer line 126 : \n${JSON.stringify(productPatch, null, 3)}`);
        
        try {
          newProduct = await this.productsModel.findOneAndUpdate(
            { product: productPatch.product },
            productPatch,
            { upsert: true, new: true}
          ).exec();
          console.log(`BuilderService.handleAddOffer line 170 : \n${JSON.stringify(newProduct, null, 3)}`);
          return newProduct;
        } catch (e) {
          console.log(`Error in BuilderService.handleAddOffer: \n${JSON.stringify(e, null, 3)}`);
        }
        newProduct = await this.storeProduct(productPatch);
      } else {
        newProduct = await this.productsModel.findOne({product: event.payload.product})
      }
      
      return newProduct;
    }

    async handleOrderPicked(event: BuildEvent) {
      const params = event.payload;
      const order = await this.ordersModel.findOneAndUpdate(
        { code: params.code },
        { state: params.state }, 
        {new : true}
      ).exec();

      /******Updating product amount after a picking from the warehouse */
      const pal = await this.productsModel.findOneAndUpdate(
        { product: order.product},
        { $inc : {amount: -1 } },
        { new: true }
      ).exec();
      /******** */

      
      const newEvent: BuildEvent = {
        blockId: order.code,
        time: new Date().toISOString(),
        eventType: 'orderPicked',
        payload: {
          code: order.code,
          product: order.product
        }, 
        tags: ['orders', order.code],
      } ;

      await this.storeEvent(newEvent);
      this.publish(event);
    }

    async handleSubscription(subscription: Subscription) {
      if (!this.subscriberUrls.includes(subscription.subscriberUrl))
        this.subscriberUrls.push(subscription.subscriberUrl);
      console.log(`SubscriberUrls:\n${this.subscriberUrls}`)
      const eventList = await this.buildEventModel.find({
        eventType: 'productStored',
        time: { $gt: subscription.lastEventTime }
      }).exec();

      return eventList;
    }

    async publish(newEvent: BuildEvent) {
      console.log(`builderService.publish subscribeUrls: \n ${JSON.stringify(this.subscriberUrls, null, 3)}`);
      const oldUrls = this.subscriberUrls;  
      this.subscriberUrls = [];

      for (let subscriberUrl of oldUrls) {
        this.httpService.post(subscriberUrl, newEvent).subscribe(
          response => {
            console.log(`Shop builderService.publish post response is :\n ${JSON.stringify(response.data, null, 3)}`);
            this.subscriberUrls.push(subscriberUrl);
          },
          error => console.log(`Shop builderService.publish error :\n ${JSON.stringify(error, null, 3)}`)
        );
      }
    }

    async getCustomers() {
      return await this.customersModel.find({}).exec();
    }

    async getProducts() {
      return await this.productsModel.find({}).exec();
    }

    async getProduct(name: string) {
      return await this.productsModel.findOne({product: name}).exec();
    }

    async getOrdersOf(customer: string) {
      return await this.ordersModel.find({customer: customer}).exec();
    }

    async setPrice(params: SetPriceDto) {
      return await this.productsModel.findOneAndUpdate(
        {product: params.product},
        {price: `${params.price}` },
        {new: true}
      ).exec();
    }

    async placeOrder(params: PlaceOrderDto) {
      const orderDto = {
        code: params.order,
        product: params.product,
        customer: params.customer,
        address: params.address,
        state: 'order placed'
      }
      
      console.log(`placeOrder stored: \n${JSON.stringify(orderDto, null, 3)}`);

      const result = await this.ordersModel.findOneAndUpdate(
        {code: params.order},
        orderDto,
        {upsert: true, new: true}
      ).exec();

      console.log(`BuilderService.placeOrder stored on the line 287 the order: \n${JSON.stringify(result, null, 3)}`);

      const newCustomer = await this.customersModel.findOneAndUpdate(
        { name: params.customer },
        {
          name: params.customer,
          lastAdress: params.address
        },
        { upsert: true, new: true }
      ).exec();
      console.log(`BuilderService.placeOrder stored on the line 297 the customer: \n${JSON.stringify(newCustomer, null, 3)}`);


      const event: BuildEvent =  {
        blockId: params.order,
        time: new Date().toISOString(),
        eventType: 'productOrdered',
        tags: ['products', params.order],
        payload: orderDto
      };

      await this.storeEvent(event);
      this.publish(event);
       
    }
}