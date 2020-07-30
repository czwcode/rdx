import React, { Fragment } from 'react';
import { toArr, normalizeCol } from '../../utils';
import { Grid } from '@alifd/next';
const { Row, Col } = Grid;
export interface IFormItemGrid {
  cols: ({ span: number; offset: number } | string)[];
  children: React.ReactNode[];
}
export default function FormItemGrid(props: IFormItemGrid) {
  let { cols = [], children } = props;
  const normalizerCols = toArr(cols).map((item) => normalizeCol(item));
  children = toArr(children);
  const childNum = children.length;
  if (normalizerCols.length < childNum) {
    let offset: number = childNum - cols.length;
    let lastSpan: number =
      24 -
      normalizerCols.reduce((buf, col) => {
        return (
          buf +
          Number(col.span ? col.span : 0) +
          Number(col.offset ? col.offset : 0)
        );
      }, 0);
    for (let i = 0; i < offset; i++) {
      normalizerCols.push({ span: Math.floor(lastSpan / offset) });
    }
    const grids = (
      <Row>
        {children.reduce((buf: React.ReactNode[], child, key) => {
          return child
            ? buf.concat(
                <Col key={key} {...cols[key]}>
                  {child}
                </Col>
              )
            : buf;
        }, [])}
      </Row>
    );
    return <Fragment>{grids}</Fragment>;
  }
}
