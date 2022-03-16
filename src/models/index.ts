import { Reducer } from 'umi'
import { PathItem } from '@/types'

export interface IndexModelState {
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  gridSize: number;
  grid: boolean;
  closePath: boolean;
  activePointIndex: [number, number];
  canvasPosition: [number, number];
  paths: PathItem[];
}

export interface IndexModelType {
  namespace: 'index';
  state: IndexModelState;
  reducers: {
    save: Reducer<IndexModelState>;
  };
}

const IndexModel: IndexModelType = {
  namespace: 'index',
  state: {
    canvasWidth: 2000,
    canvasHeight: 1000,
    scale: 1,
    gridSize: 20,
    grid: true,
    closePath: false,
    activePointIndex: [0, 0],
    canvasPosition: [0, 0],
    paths: [{
      points: [{
        x: 0,
        y: 0,
      }],
      closePath: false,
      color: '#000',
      width: 4,
      fill: '#000',
    }],
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
};

export default IndexModel;