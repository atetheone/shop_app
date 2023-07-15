import { Body, Controller, Get, OnModuleInit, Logger, Param, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { AppService } from './app.service';
import Command from './modules/builder/command';
import Subscription from './modules/builder/subscription';
import { BuildEvent } from './modules/builder/build-event.schema';

@Controller()
export class AppController implements OnModuleInit {
  private logger = new Logger(AppController.name);
  public shopUrl: string = 'http://localhost:3100';
  public warehouseUrl: string = 'http://localhost:3000';
  public port = process.env.PORT || 3000;
  public publishers: any[] = [];

  constructor(
    private httpService: HttpService,
    private readonly appService: AppService
  ) {
    if (this.port != 3000) {
      this.shopUrl = 'https://atetheone-shop-backend.herokuapp.com';
      this.warehouseUrl = 'https://atetheone-warehouse-backend.herokuapp.com';
    }
  } 

  onModuleInit() {
    this.subscribeAtShop("start visit");
  }

  @Get('query/:key') 
  async getQuery(@Param('key') key: string): Promise<any> {
    console.log(`appController.getQuery called with ${key}`);
    
    const result = await this.appService.getQuery(key);
    return result;
  }

  @Post('cmd/pickDone')
  async postpickDone(@Body() params: any) {
    try {
      this.logger.log(`\npickDone got ${JSON.stringify(params, null, 3)}`);
      const c = await this.appService.handlePickDone(params);
      return c;
    } catch (e) {

    }
  }

  @Post('cmd')
  async postCommand(@Body() command: Command) {
    try {
      this.logger.log(`got command ${JSON.stringify(command, null, 3)}`);
      const c = await this.appService.handleCommand(command);
      return c;
    } catch (error) {
      return error
    }

  }

  @Post('event')
  async postEvent(@Body() event: BuildEvent) {
    try {
      return await this.appService.handleEvent(event);
    } catch (e) {
      return e;
    }
  }

  @Post('subscribe')
  async postSubscribe(@Body() subscription: Subscription) {
    try {
      this.logger.log(`\npostSubscribe got subscription ${JSON.stringify(subscription, null, 3)}`);
      const c = await this.appService.handleSubscription(subscription);
      if (subscription.reason === "start visit")
        this.subscribeAtShop("return visit"); 
      return c;     
    } catch (e) {
      return e;
    }
  }


  private subscribeAtShop(reason: string) {
    this.httpService.post(this.shopUrl + '/subscribe', {
      subscriberUrl: this.warehouseUrl + '/event',
      lastEventTime: '0',
      reason: reason
    }).subscribe( 
      async response => {
        this.publishers.push(this.shopUrl);
        try {
          const eventList: any[] = response.data;
          for (const event of eventList) {
            const pureEvent = {
              blockId: event.blockId,
              tags: event.tags,
              time: event.time,
              eventType: event.eventType,
              payload: event.payload
            }          
            console.log(`AppController onModuleInit subscribe handleEvent:\n ${JSON.stringify(pureEvent, null, 3)}`);
            await this.appService.handleEvent(pureEvent);
          } 
        } catch (e) {
          console.log(`AppController onModuleInit subscribe handleEvent error ${JSON.stringify(e, null, 3)}`);
          
        }
      },
      error => console.log(`AppController onModuleInit error ${JSON.stringify(error, null, 3)}`)  
    )
  }
 
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
