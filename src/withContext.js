import React from 'react';

const withContext = Context => Component => {
    return props => <Context.Consumer>
        { context => <Component context={context} {...props} />}
    </Context.Consumer>
};

export default withContext;