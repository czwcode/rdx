import React, { useRef, useEffect } from 'react';
import { ShareContextClass, Base, RdxContext, RdxContextProps } from '@czwcode/rdx';
import { RdxFormItem } from '../FromItem';
import { set, get } from '../../utils';
import { produce } from 'immer';
import {
  ErrorContextInstance,
  ErrorContextClass,
  GlobalErrorContextInstance,
} from '../../hooks/formStatus';
import { FormRdxStateContext } from '../../hooks/rdxStateFormHooks';
import { isFunction } from '../../utils/base';
import { BaseType } from '../../global';
import JsonToTS from 'json-to-ts';
import Preview from '../Preview';
import { IModel } from '../FromItem/types';
export interface IRdxFormContext extends RdxContextProps {
  children: React.ReactNode;
  state?: any;
  initializeState?: any;
  enabledStatePreview?: boolean;
  enabledTypescriptGenerte?: boolean;
  visualStatePlugins?: React.ReactNode | React.ReactNode[];
  typescriptGenerateOptions?: { rootName: string };
  onChange?: (state: any) => void;
}

class FormStore<T> implements Base<IModel<T>> {
  store: {
    state: any;
    runningState: any;
  };
  clone(): Base<IModel<T>> {
    return new FormStore(this.store);
  }
  merge(scope: string): void {
    throw new Error('Method not implemented.');
  }
  // 实际数据
  state: { [key: string]: any } = {};
  // 运行时逻辑
  runningState: { [key: string]: IModel<T> } = {};
  constructor(v: { state: any; runningState: any }) {
    this.store = v;
  }
  remove(key: string, scope?: string) {
    this.store = produce(this.store, (store) => {
      set(store.state, key, undefined);
      delete store.runningState[key];
    });
  }
  update(key: string, value: IModel<T>, scope?: string): void {
    if(!value) {
      return 
    }
    let { value: currentV, ...rest } = value;
    this.store = produce(this.store, (store) => {
      set(store.state, key, value.value);
      store.runningState[key] = rest;
    });
  }
  get(key: string, scope?: string): IModel<T> | null {
    const value = get(this.store.state, key);
    const others = this.store.runningState[key];
    return value === undefined && others === undefined
      ? undefined
      : {
          disabled: false,
          value: value,
          ...others,
        };
  }
  getAll(): any {
    return this.store;
  }
}

export function getEmptyValue(type) {
  if (type === BaseType.Boolean) {
    return true;
  }
  if (type === BaseType.String) {
    return '';
  }
  if (type === BaseType.Array) {
    return [];
  }
  if (type === BaseType.Object) {
    return {};
  }
  if (type === BaseType.Number) {
    return 0;
  }
}

function isRdxFormItem(obj) {
  try {
    return obj  === RdxFormItem;
  } catch (e) {
    return false; //
  }
}
// ReactChild | ReactFragment | ReactPortal | boolean | null | undefined
function children2Json(children: React.ReactNode, useVirtual: boolean = false) {
  const root = {};
  function travserArray(paths, child) {
    const currentChildrenProps = child.props;
    const currentChildrenType = currentChildrenProps.type;
    if ([BaseType.Object].includes(currentChildrenType)) {
      set(root, [...paths, 0].join('.'), getEmptyValue(currentChildrenType));
      travser([...paths, 0], currentChildrenProps.children);
    } else if ([BaseType.Array].includes(currentChildrenType)) {
      set(root, [...paths, 0].join('.'), getEmptyValue(currentChildrenType));
      travserArray([...paths, 0], currentChildrenProps.children);
    } else {
      set(root, [...paths, 0].join('.'), getEmptyValue(currentChildrenType));
    }
  }
  function travser(paths = [] as string[], children) {
    React.Children.forEach(children, (child) => {
      if (!child || !child.props) {
        return;
      }
      console.log(2222, RdxFormItem)
      if (isRdxFormItem(child.type)) {
        if (!child.props.virtual || useVirtual) {
          set(
            root,
            [...paths, child.props.name].join('.'),
            getEmptyValue(child.props.type)
          );
          if ([BaseType.Object].includes(child.props.type)) {
            travser([...paths, child.props.name], child.props.children);
          } else if ([BaseType.Array].includes(child.props.type)) {
            const currentChildren = child.props.children;
            set(
              root,
              [...paths, child.props.name].join('.'),
              getEmptyValue(child.props.type)
            );
            travserArray([...paths, child.props.name], currentChildren);
          }
        }
      } else if (isFunction(child.type)) {
        if (
          child.type.prototype &&
          (child.type.prototype.render ||
            child.type.prototype.isPureReactComponent)
        ) {
          try {
            travser(paths, new child.type(child.props).render());
          } catch (error) {
            travser(paths, child.props.children);
          }
        } else {
          travser(paths, child.type(child.props));
        }
      } else {
        travser(paths, child.props.children);
      }
    });
  }
  travser([], children);
  return root;
}

const RdxFormContext = <T extends Object>(props: IRdxFormContext) => {
  const {
    state,
    children,
    initializeState,
    onChange,
    enabledStatePreview,
    enabledTypescriptGenerte,
    visualStatePlugins,
    typescriptGenerateOptions = { rootName: 'RootObject' },
    ...rest
  } = props;
  const innerStateRef = useRef<FormStore<T>>(
    new FormStore({ state: {}, runningState: {} })
  );
  const formContextRef = useRef<any>(null);
  const errorContextRef = useRef<ErrorContextClass>(new ErrorContextClass());

  return (
    <RdxContext
      {...rest}
      visualStatePlugins={visualStatePlugins}
      context={FormRdxStateContext}
      initializeState={
        state
          ? {
              state: state,
              runningState: innerStateRef.current.runningState,
            }
          : { state: initializeState || {}, runningState: {} }
      }
      createStore={(data) => {
        return new FormStore(data) as any;
      }}
      onChange={(state) => {
        onChange && onChange(state.state);
      }}
    >
      <GlobalErrorContextInstance.Provider value={errorContextRef.current}>
        <div ref={formContextRef}>{children}</div>
        {enabledStatePreview && <Preview />}
        {enabledTypescriptGenerte && (
          <div>
            <pre>{JSON.stringify(children2Json(children, true), null, 2)}</pre>
            <pre>
              {JsonToTS(children2Json(children, true), {
                rootName: typescriptGenerateOptions.rootName,
              }).map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </pre>
          </div>
        )}
      </GlobalErrorContextInstance.Provider>
    </RdxContext>
  );
};

export default RdxFormContext;
