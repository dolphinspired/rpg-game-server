import { MessageRoute } from '..';

import { GetDataRoute } from './getdata';

export default function getAllRoutes(): MessageRoute[] {
  return [
    new GetDataRoute()
  ]
}