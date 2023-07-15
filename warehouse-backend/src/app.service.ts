import { Injectable } from '@nestjs/common';
import { BuildEvent } from './modules/builder/build-event.schema';
import { BuilderService } from './modules/builder/builder.service';
import Command from './modules/builder/command';
import Subscription from './modules/builder/subscription';

@Injectable()
export class AppService {

  constructor(
    private readonly modelBuilderService: BuilderService
  ) {}

  async getQuery(key: string): Promise<any> {
    console.log('appService.getQuery starts...');
    if (key === "pick-tasks") {
      return await this.modelBuilderService.getPickTasks();
    } else if (key.startsWith("pick-task_")) {
      const code = key.substring('pick-task_'.length);
      return await this.modelBuilderService.getPickTaskByCode(code);
    } else if (key === 'palettes') {
      const res = await this.modelBuilderService.getPalettes();

      const answer = {
        key: key,
        result: res
      };

      return answer;
    }
    const list = await this.modelBuilderService.getByTag(key);
    const answer = {
      key: key,
      result: list
    }
    console.log('appService.getQuery ends...');
    return answer;
  }
    
  async handleCommand(command: Command) {
    if (command.opCode === 'storePalette') {
      await this.modelBuilderService.storePalette(command.parameters);
      return command;
    } else {
      return `cannot handle ${command.opCode}`;
    }
  }

  async handleEvent(event: BuildEvent) {
    if (event.eventType === "productOrdered")
      return await this.modelBuilderService.handleProductOrdered(event);
    return { error: `Warehouse backend does not know how to handle ${event.eventType}`}
  }
  
  async handlePickDone(params: any) {
    return await this.modelBuilderService.handlePickDone(params);
    
  }

  async handleSubscription(subscription: Subscription) {
    return await this.modelBuilderService.handleSubscription(subscription);
  }


  getHello(): string {
    return 'Hello World!';
  }
}
