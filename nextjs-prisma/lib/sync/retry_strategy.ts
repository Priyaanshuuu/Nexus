export class RetryStrategy{
    static readonly MAX_RETRIES = 6
    static readonly BASE_DELAY_MS = 1000
    static readonly MAX_DELAY_MS = 6000

    static getDelay(attemptNumber : number) : number {
        if(attemptNumber <= 0) return 0
        if(attemptNumber > this.MAX_RETRIES) return this.MAX_DELAY_MS

        const exponentialDelay = Math.pow(2 , attemptNumber-1) * this.BASE_DELAY_MS
        return Math.min(exponentialDelay , this.MAX_DELAY_MS)
    }

    static shouldTry(retryCount : number) : boolean {
        return retryCount < this.MAX_RETRIES
    }

    static getRetryInfo(retryCount : number) : {
        shouldRetry : boolean
        nextDay : number
        retriesLeft : number
    }{
        return {
            shouldRetry : this.shouldTry(retryCount),
            nextDay: this.getDelay(retryCount+1),
            retriesLeft : this.MAX_RETRIES - retryCount
        }
    }




}