import { Directive, Input, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { EventBus } from '../service/event-bus';
import { eventType } from '../config/event-type';
import { Subject, Subscription, switchMap, takeUntil, timer } from 'rxjs';

@Directive({
  selector: '[virtualScroll]'
})
export class VirtualScroll implements AfterViewInit, OnDestroy {
  // 输入参数：子项选择器
  @Input('itemSelector') itemSelector: string = '';

  // 输入参数：观察者配置
  @Input('observerConfig') observerConfig = {};

  private hostElement: HTMLElement;
  private observer: IntersectionObserver | null;
  private items: Array<HTMLElement> = [];
  private debounceFn: any;
  private entriesArr: IntersectionObserverEntry[] = [];

  constructor(private el: ElementRef, private eventBusService: EventBus) {
    // 获取到宿主元素-导航容器的DOM引用
    this.hostElement = this.el.nativeElement;
    this.observer = null;
    this.debounceFn = this.debounce(this.handleIntersection.bind(this), 1000);
  }

  /**
   * @description 创建一个计时器
   * @param restart$
   */
  private createItemVisibleSubscription(restart$: Subject<void>, stop$: Subject<void>, delay: number): Subscription {
    return restart$.pipe(
      switchMap(() => timer(delay).pipe(
        takeUntil(stop$)
      ))
    ).subscribe(() => {
      this.handleIntersection(this.entriesArr);
      this.entriesArr = [];
    })
  }

  /**
   * @description 当组件加载完成后执行的操作
   */
  ngAfterViewInit(): void {
    this.setupVirtualScroll();
  }

  /**
   * @description 组件销毁
   */
  // 组件销毁时
  ngOnDestroy(): void {
    this.debounceFn.destroy(); // 必须调用！
    this.observer?.disconnect();
  }

  /**
   * @description 防抖
   */
  private debounce(fn: Function, delay: number): Function {
    let subscription: Subscription;
    const restart$ = new Subject<void>();
    const stop$ = new Subject<void>();
    const debounceFn = (entries: IntersectionObserverEntry[]): void => {
      this.entriesArr = this.entriesArr.concat(entries);
      // 执行stop
      stop$.next();
      subscription?.unsubscribe();

      // 存储定时器返回的引用
      subscription = this.createItemVisibleSubscription(restart$, stop$, delay)
      // 执行重新计时
      restart$.next();
    }

    // 添加销毁方法
    debounceFn.destroy = () => {
      stop$.next();
      subscription?.unsubscribe();
      restart$.complete();
      stop$.complete();
    };

    return debounceFn;
  }

  /**
   * @description 创建虚拟滚动观察者
   */
  private setupVirtualScroll(): void {
    // 创建intersectionObserver
    this.observer = new IntersectionObserver(
      this.debounceFn, {
      ...this.observerConfig,
      root: this.hostElement
    }
    )

    // 观察所有子导航项
    const items = this.getItems();
    if (this.observer) {
      // 防止TypeScript认为this.observer在循环过程中可能会改变发出警告
      const observer = this.observer;
      items.forEach(item => observer.observe(item));
    }
  }

  /**
   * @description 观察者在目标进入视图和离开视图时进行的操作
   * @param entries 
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const item = entry.target as HTMLElement;
      if (entry.isIntersecting) {
        // 导航项进入可视区域
        this.onItemVisible(item);
      }
      else {
        // 导航项离开可视区域
        this.onItemHidden(item);
      }
    })
  }

  /**
   * @description 获取所有项目的DOM
   */
  private getItems(): Array<HTMLElement> {
    return Array.from(this.hostElement.querySelectorAll<HTMLElement>(this.itemSelector));
  }

  /**
   * @description 导航项可见时进行的操作
   * @param item
   */
  private onItemVisible(item: HTMLElement): void {
    console.log('项目进入视图', item, item.id);
    this.eventBusService.dispatch(eventType.CHANGE_ITEM, { id: item.id, showFlag: true });
  }

  /**
   * @description 导航项不可见时进行的操作
   * @param item
   */
  private onItemHidden(item: HTMLElement): void {
    this.eventBusService.dispatch(eventType.CHANGE_ITEM, { id: item.id, showFlag: false });
  }

  /**
   * @deprecated __ngContext__无效
   * @description 获取子项作用域
   * @param item 
   */
  private getItemScope(item: HTMLElement): any {
    // 从DOM元素中获取Angular添加的属性
    const ngContext = (item as any).__ngContext__;
    console.log(ngContext);
    if (ngContext && ngContext.length > 1) {
      return ngContext[1];
    }
    return null;
  }
}


