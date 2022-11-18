class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.page;
    this.limit;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort({ Date: sortBy === 'DateAsc' ? 1 : -1 });
    } else {
      this.query = this.query.sort('Date');
    }

    return this;
  }

  limitField() {
    //field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    this.page = +this.queryString.page || 1;
    this.limit = +this.queryString.limit || 380;
    const skip = this.limit * (this.page - 1);

    this.query = this.query.skip(skip).limit(this.limit);

    return this;
  }
}

module.exports = APIFeatures;
