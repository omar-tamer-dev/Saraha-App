

export const create = async ({model, data, options = {} } = {}) => {
     return  await model.create([data], options);
}

export const findOne = async ({model, filter, options = {} } = {}) => {
     return  await model.findOne(filter, options);
}

export const findById = async ({model, id, options = {} } = {}) => {
     return  await model.findById(id, options);
}

export const find = async ({ model, filter = {}, select = "", options = {} } = {}) => {
  return await model.find(filter)
  if (options?.limit) {data.limit(options?.limit)};
  if (options?.skip) {data.skip(options?.skip)};
  if (options?.sort) {data.sort(options?.sort)};
  if (options?.populate) {data.populate(options?.populate)};

  return data.exec();
};

export const findByIdAndUpdate = async ({model, id, update, options = {} } = {}) => {
     return  await model.findByIdAndUpdate(id, update, {returnDocument: "after", runValidators: true, ...options});
}


