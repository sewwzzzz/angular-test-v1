import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class EventBus {

  private static listeners: Record<string, any> = {};

  public addEventListener(type: string, callback: Function, scope: any, ...args: any[]): void {
    //检测对象里面有没有这个事件名，如果没有就添加这个事件名（key），
    //并把事件添加到一个新数组（value）中与事件名对应，一个事件名可以对应多个事件。
    if (typeof EventBus.listeners[type] != "undefined") {
      EventBus.listeners[type].push({
        scope: scope,
        callback: callback,
        args: args
      });
    } else {
      EventBus.listeners[type] = [{
        scope: scope,
        callback: callback,
        args: args
      }];
    };
  }

  public removeEventListener(type: string, callback: Function, scope: any): void {

    //检测对象里面有没有这个事件名
    if (typeof EventBus.listeners[type] != "undefined") {
      //遍历这个事件名对应的事件数组
      let numOfCallbacks = EventBus.listeners[type].length;
      let newArray = new Array();
      for (let i = 0; i < numOfCallbacks; i++) {
        let listener = EventBus.listeners[type][i];
        //如果找到 事件回调，当前执行上下文都一样的事件就从事件数组中删除这个事件
        if (listener.scope == scope && listener.callback == callback) {

        } else {
          newArray.push(listener);
        }
      }
      EventBus.listeners[type] = newArray;
    }
  }

  /**
   * 派发事件
   * @param type 
   * @param target 
   * @param args
   */
  public dispatch(type: string, ...args: any | any[]): void {
    //把事件名和传递的值放进event对象
    let event = {
      type: type,
      args: null
    };

    if (args) {
      if (args.length > 1) {
        event.args = args;
      } else {
        event.args = args[0];
      }
    }

    let myArgs = [event].concat(args);
    //从对象里面找到事件名（key）对应的数组（value）
    if (typeof EventBus.listeners[type] != "undefined") {
      // 创建副本，防止执行过程中监听器被移除
      // 遍历这个数组分别在当前的执行上下文下执行每个事件
      let listeners = EventBus.listeners[type].slice();
      let numOfCallbacks = listeners.length;
      for (let i = 0; i < numOfCallbacks; i++) {
        let listener = listeners[i];
        if (listener && listener.callback) {
          let concatArgs = myArgs.concat(listener.args);
          listener.callback.apply(listener.scope, concatArgs);
        }
      }
    };
  }

  /**
   * 获取所有事件
   * @returns 
   */
  public getEvents(): string {
    let str = "";
    //遍历所有监听对象
    for (let type in EventBus.listeners) {
      let numOfCallbacks = EventBus.listeners[type].length;
      //再分别遍历各个监听事件数组,在拼接字符串
      for (let i = 0; i < numOfCallbacks; i++) {
        let listener = EventBus.listeners[type][i];
        str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
        str += " listen for '" + type + "'\n";
      }
    }
    return str;
  }

  /**
   * @name hasEventListener 存在监听
   * @param {String} type 事件名称
   * @param {func} callback 事件的回调函数
   * @param {Object} scope 当前的上下文执行坏境
   * @description 检测是否有此事件
   */
  public hasEventListener(type: string, callback: Function, scope: any): boolean {
    //检测是否有这个事件名，没有直接返false
    if (typeof EventBus.listeners[type] != "undefined") {
      //如果只传一个事件名参数，返true
      let numOfCallbacks = EventBus.listeners[type].length;
      if (callback === undefined && scope === undefined) {
        return numOfCallbacks > 0;
      }
      for (var i = 0; i < numOfCallbacks; i++) {
        //如果传了回调函数会判断是否相等，执行环境传了也会做比较（不传的话默认是相等的），都相等返回true否则返回false
        let listener = EventBus.listeners[type][i];
        if ((scope ? listener.scope == scope : true) && listener.callback == callback) {
          return true;
        }
      }
    }
    return false;
  };

}
