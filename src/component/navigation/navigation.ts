import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import NavigationModel from '../../model/navigation';
import navigationMockup from '../../data/navigation-mockup';
import { VirtualScroll } from '../../directive/virtual-scroll';
import { EventBus } from '../../service/event-bus';
import { eventType } from '../../config/event-type';
import { IEvent } from '../../model/event';

@Component({
  selector: 'navigation',
  imports: [NgFor, NgIf, VirtualScroll],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {

  protected navigationList: Array<NavigationModel>;
  constructor(private eventBusService: EventBus) {
    this.navigationList = navigationMockup;

    // 绑定显示/隐藏导航项的监听事件
    if (!this.eventBusService.hasEventListener(eventType.CHANGE_ITEM, this.itemChangeEventCallback, this)) {
      this.eventBusService.addEventListener(eventType.CHANGE_ITEM, this.itemChangeEventCallback, this);
    }
  }

  private itemChangeEventCallback(event: IEvent<{ id: string, showFlag: boolean }>, args: { id: string, showFlag: boolean }): void {
    const navItem = this.navigationList.filter((item) => item.id === event.args.id)[0];
    navItem.isVisible = event.args.showFlag;
  }

  public trackByItems(index: number, item: NavigationModel): string {
    return item.id;
  }
}
