import {PropertyMetadata} from '../interfaces/metadata';
import * as _ from 'lodash';

export interface DecorationConfig {
  name: string;
  args: any[];
}

interface ValidationConfig {
  [type: string]: ValidationConfigDeclaration;
}

interface ValidationFunction {
  (...args: any[]): PropertyMetadata;
}

interface ValidationConfigDeclaration {
  [type: string]: PropertyMetadata | ValidationFunction;
}

const internalMapping: ValidationConfig = {
  array: {
    arraymaxsize: (i) => {
      return {
        maxItems: parseInt(i, 10)
      };
    },
    arrayminsize: (i) => {
      return {
        minItems: parseInt(i, 10)
      };
    }
  },
  number: {
    isint: {
      format: 'int64',
      type: 'integer'
    },
    isnegative: {
      exclusiveMaximum: true,
      maximum: 0,
    },
    ispositive: {
      exclusiveMinimum: true,
      minimum: 0,
    },
    max: (i) => {
      return {
        maximum: parseFloat(i)
      };
    },
    min: (i) => {
      return {
        maximum: parseFloat(i)
      };
    }
  },
  string: {
    fake: {
      minimum: 0
    },
    fakeme: (i) => {
      return {
        maximum: parseInt(i, 10) + 99
      };
    },
    maxlength: (i) => {
      return {
        maxLength: parseInt(i, 10)
      };
    },
    minlength: (i) => {
      return {
        minLength: parseInt(i, 10)
      };
    }
  }
};

export class ValidationGenerator {
  private config: ValidationConfig;
  constructor() {
    this.config = internalMapping;
  }

  public getProperties(decorators: DecorationConfig[], type: string) {
    let configType = this.config[type];

    if (!configType) { return {}; }

    let ret = {};

    decorators.map((dec) => {
      let decName = dec.name.toLowerCase();
      if (!configType[decName]) {
        return;
      }
      let combine: Object;
      if (typeof configType[decName] === 'function') {
        combine = (configType[decName] as ValidationFunction).apply(null, dec.args);
      } else {
        combine = configType[decName] as PropertyMetadata;
      }
      _.assign(ret, combine);
    });

    return ret;
  }
}
