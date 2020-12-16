export const routeConfigs = {
    general: {
        root: '/',
        resourceId: '/:id'
    },
    users: {
        baseUrl: '/users',
        userConfirmation: '/confirmation',
        login: '/login',
        signup: '/signup'
    },
    events: {
        baseUrl: '/events'
    },
    contributions: {
        baseUrl: '/contributions',
        makeContribution: '/contribute',
        verifyContribution: '/verify'
    },
    admin: {
        baseUrl:'/admin',
        getAllUsers: '/users',
        getAllContributions: '/contributions'
    }
}