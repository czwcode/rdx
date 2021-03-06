import { normalizeSingle2Arr, NotifyPoint } from '@czwcode/graph-core';
import DeliverByPreDefinedTask from './DeliverByPreDefinedTask';

export default class CommonQueue<T> extends DeliverByPreDefinedTask<T> {
  getTaskByPointWithScope(points: string[], scope: string | null) {
    return points.map((point) => {
      return {
        key: point,
        scope,
      };
    });
  }
  initExecute(scope: string | null) {
    const startPoints = this.getFirstPoints(scope);
    this.deliver(this.getTaskByPointWithScope(startPoints, scope));
  }
  /**
   *
   * @param newWho 谁的下游节点
   */
  notifyDownstream = (who: NotifyPoint | NotifyPoint[]) => {
    // @ts-ignore
    const newWho = normalizeSingle2Arr<NotifyPoint>(who);
    if (newWho.every((w) => isString(w.key))) {
      this.deliver(newWho);
    } else {
      console.warn('触发节点的格式必须为{ key: string, scope?: string }');
    }
  };
}

export function isString(myVar: any) {
  return typeof myVar === 'string' || myVar instanceof String;
}
