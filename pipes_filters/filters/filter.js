class Filter {
    constructor() {
        this.filters = []
    }

    add(filter) {
        this.filters.push(filter)
    }

    async execute(message) {
        let data = message
        for (const filter of this.filters) {
            data = await filter.process(data)
        }
        return data
    }
}

module.exports = Filter