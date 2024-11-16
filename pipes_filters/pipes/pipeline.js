class Pipeline {
    constructor() {
        this.filters = []
    }

    addFilter(filter) {
        this.filters.push(filter)
    }

    async execute(message) {
        let data = message
        for (const filter of this.filters) {
            data = await filter.execute(data)
        }
        return data
    }
}

module.exports = Pipeline