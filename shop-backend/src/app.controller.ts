import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Logger, OnModuleInit, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PlaceOrderDto } from './common/PlaceOrderDto';
import { SetPriceDto } from './common/SetPriceDto';
import { BuildEvent } from './modules/builder/build-event.schema';
import Subscription from './modules/builder/Subscription';

@Controller()
export class AppController implements OnModuleInit{
  private logger = new Logger(AppController.name);
  public shopUrl: string = 'http://localhost:3100';
  public warehouseUrl: string = 'http://localhost:3000';
  public port = process.env.PORT || 3100;
  public publishers: any[] = [];

  constructor(
    private httpService: HttpService,
    private readonly appService: AppService
  ) {
    if (this.port != 3100) {
      this.shopUrl = 'https://atetheone-shop-backend.herokuapp.com';
      this.warehouseUrl = 'https://atetheone-warehouse-backend.herokuapp.com';
    }
  } 

  onModuleInit() {
      this.subscribeAtWarehouse("start visit");
  }
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('reset')
  async getReset() {
    return await this.appService.getReset();
  }
 
  @Get('query/:key')
  async getQuery(@Param('key') key: string): Promise<any> {
    const result = await this.appService.getQuery(key);
    return result;
  }

  @Post('event')
  async postEvent(@Body() event: BuildEvent) {
    try {
      return await this.appService.handleEvent(event);
    } catch (e) {
      return e;
    }
  }

  @Post('cmd/setPrice')
  async postCommand(@Body() params: SetPriceDto) {
    try {
      const c = await this.appService.setPrice(params);
      return c; 
    } catch (e) {
      return e;
    }
  }

  @Post('cmd/placeOrder')
 async postPlaceOrder(@Body() params: PlaceOrderDto) {
   try {
    const c = await this.appService.placeOrder(params);
    return c;
   } catch (e) {
    return e;
   }
 }

  @Post('subscribe')
  async postSubscribe(@Body() subscription: Subscription) {
    try {
      // console.log(`\npostSubscribe got subscription ${JSON.stringify(subscription, null, 3)}`);
      const c = await this.appService.handleSubscription(subscription);
      if (subscription.reason === "start visit")
        this.subscribeAtWarehouse("return visit");
      return c;     
    } catch (e) { 
      return e;
    }
  }

  private subscribeAtWarehouse(reason) {
    if (this.publishers.length > 0) {
      return;
    }
 
    this.httpService.post(this.warehouseUrl + '/subscribe', {
      subscriberUrl: this.shopUrl + '/event',
      lastEventTime: '0',
      reason: reason,
    }).subscribe(
      async response => {
        this.publishers.push(this.warehouseUrl);
        try {
          
          const eventList = response.data;
          console.log(`AppController onModuleInit subscribe list ${JSON.stringify(eventList, null, 3)}`);
          for (const event of eventList) {
            await this.appService.handleEvent(event);
          } 
        } catch (e) {
          console.log(`AppController onModuleInit subscribe handleEvent error ${JSON.stringify(e, null, 3)}`);
          
        }
      },
      error => console.log(`AppController onModuleInit error ${JSON.stringify(error, null, 3)}`)  
    )

  }
 
}
