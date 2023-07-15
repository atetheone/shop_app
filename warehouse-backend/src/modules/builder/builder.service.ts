import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BuildEvent } from './build-event.schema';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import Subscription from './subscription';
import { Palette } from './palette.schema';
import { PickTask } from './pick-task.shema';
import { AppController } from 'src/app.controller';

@Injectable()
export class BuilderService implements OnModuleInit {

    subscriberUrls: string[] = []
    logger: Logger = new Logger(AppController.name);

    constructor(
      @InjectModel('eventStore') private buildEventModel: Model<BuildEvent>,
      @InjectModel('paletteStore') private paletteModel: Model<Palette>, 
      @InjectModel('pickTaskStore') private pickTaskModel: Model<PickTask>,   
          
      private httpService: HttpService
    ) {}

    onModuleInit() {
        //await this.clear();
        
        
    }

    getByTag(tag: string) {
      console.log('getByTag is called with ' + tag);
      const list = this.buildEventModel.find({ tags: tag }).exec();
      console.log(list);
      
      return list;
      
    }

    async getPalettes() {
      return await this.paletteModel.find({}).exec();
    }

    async getPickTasks() {
      return await this.pickTaskModel.find({}).exec();
    }
    
    async getPickTaskByCode(code) {
      return await this.pickTaskModel.findOne({code: code}).exec();
    }
  
    async store(event: BuildEvent) {
      const filter =  { blockId: event.blockId };
      // ensure at least a placholder
      const placeholder = await this.buildEventModel.findOneAndUpdate(
        filter,
        { blockId: event.blockId, $setOnInsert: { time: '' } },
        { upsert: true, new:true }
      ).exec();
      
      const newEvent = await this.buildEventModel.findOneAndUpdate(
        { blockId: event.blockId, time: { $lt: event.time } },
        event,
        { new:true }
      ).exec();
      console.log(`BuilderService.store line 62: \n${JSON.stringify(newEvent, null, 3)}`);

      
      return newEvent != null;
    }

    private async storeModelPalette(palette: Palette) {
      await this.paletteModel.findOneAndUpdate(
        { barcode: palette.barcode},
        palette,
        { upsert: true }
      ).exec();
    }

    
    async storePalette(palette: any) {
      palette.amount = Number(palette.amount);

      const event = {
        blockId: palette.barcode,
        eventType: 'paletteStored',
        payload: palette,
        tags: ['palettes', palette.product],
        time: new Date().toISOString()
      };

      try {
        const storeSuccess = await this.store(event);
        if (storeSuccess) {
          await this.storeModelPalette(palette);
          const newAmount = await this.computeAmount(palette.product);

          const newEvent = {
            blockId: palette.barcode,
            eventType: 'productStored',
            payload: {
              product: palette.product,
              amount: newAmount
            },
            tags: [],
            time: event.time
          }
          console.log(`store and publishing...`);
          console.log(`BuilderService.storePalette stores ${JSON.stringify(newEvent, null, 3)}`);
          await this.store(newEvent);
          this.publish(newEvent);
        }
      } catch (error) {
        console.log(`store did not work ${error}`);
        
      }

      return palette;
      
    }
      

    clear() {
      return this.buildEventModel.deleteMany();
    }

    async computeAmount(productName: any) {
      const paletteStoredList = await this.paletteModel.find({
        product: productName
      }).exec();

      let sum = 0;
      for (let palette of paletteStoredList) {
        sum += palette.amount;
      }

      return sum;
    }
 
    async handleSubscription(subscription: Subscription) {
      if (!this.subscriberUrls.includes(subscription.subscriberUrl))
        this.subscriberUrls.push(subscription.subscriberUrl);
       
      const eventList = await this.buildEventModel.find({
        eventType: 'productStored',
        time: { $gt: subscription.lastEventTime }
      }).exec();

      return eventList;
    }

    async publish(newEvent: BuildEvent) {
      console.log(`builderService publish subscribeUrls: \n ${JSON.stringify(this.subscriberUrls, null, 3)}`);
      const oldUrls = this.subscriberUrls;  
      this.subscriberUrls = [];

      for (let subscriberUrl of oldUrls) {
        this.httpService.post(subscriberUrl, newEvent).subscribe(
          response => {
            console.log(`Warehouse builder service publish post response is \n ${JSON.stringify(response.data, null, 3)}`);
            this.subscriberUrls.push(subscriberUrl);
          },
          error => console.log(`builderService publish error \n ${JSON.stringify(error, null, 3)}`)
        );
      }
    }

    async handlePickDone(params: any) {
      const pal = await this.paletteModel.findOneAndUpdate(
        { 
          product:params.product,
          location: params.location},
        {
          $inc: { amount: -1 }
        },
        { new: true }
      ).exec();

      this.logger.log(`handlePickDone new pal\n${JSON.stringify(pal, null, 3)}`);

      // update PickTask
      const pick = await this.pickTaskModel.findOneAndUpdate(
        { code: params.taskCode },
        {
          palette: params.product,
          state: 'shipping'
        },
        { new: true }
      ).exec();

      // publish change
      const event: BuildEvent = {
        blockId: pick.code,
        time: new Date().toISOString(),
        eventType: 'orderPicked',
        tags: ['orders', pick.code],
        payload: {
          code: pick.code,
          state: pick.state
        }
      };

      const storeSuccess = await this.store(event);
      this.publish(event);
      return storeSuccess 
    }

    async handleProductOrdered(event: BuildEvent) {
      const storeSuccess = await this.store(event);
      if (storeSuccess) {
        const params = event.payload;
        const productPalettes = await this.paletteModel.find({product: params.product}).exec();
        const locations: string[] = [];
        for (const pal of productPalettes) {
          locations.push(pal.location);
        }

        const pickTask = {
          code: params.code,
          product: params.product,
          address: params.customer + ', ' + params.address,
          locations: locations,
          state: 'order placed'
        };

        const result = this.pickTaskModel.findOneAndUpdate(
          { code: params.code },
          pickTask,
          {upsert: true, new: true}
        ).exec();
      }

      return 200;
    }
}

