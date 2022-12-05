const ITEMS_PER_PAGE = 4;
const BUTTONS_ON_ONE_SIDE = 4; // except first and last buttons
const ACTIVE_BUTTON = 1;

exports.perPage = ITEMS_PER_PAGE;

const getCurrentPage = (page) => {
    let currentPage;
    if(page) {
        currentPage = Number(page);
    } else {
        currentPage = 1;
    }
    return currentPage;
}

const findLastPage = (totalItems) => {
    return Math.ceil(totalItems / ITEMS_PER_PAGE);
}

exports.previousPage = (page) => {
    return page - 1;
}

exports.currentPage = (page) => {
    return getCurrentPage(page);
}

exports.findLastPage = (totalItems) => {
    return findLastPage(totalItems);
}

exports.toView = (page, totalItems,) => {
    const lastPage = findLastPage(totalItems);
    const currentPage = getCurrentPage(page);

    let renderFirstButton = false;
    let renderLastButton = false;
    let prevButtons = BUTTONS_ON_ONE_SIDE;
    let nextButtons = BUTTONS_ON_ONE_SIDE;
    let rightDots = false;
    let leftDots = false;

    const pagesOnTheLeft = page - ACTIVE_BUTTON;
    const pagesOnTheRight = lastPage - page;

    if (pagesOnTheLeft > BUTTONS_ON_ONE_SIDE) {
        renderFirstButton = true;
        if (pagesOnTheLeft > BUTTONS_ON_ONE_SIDE + ACTIVE_BUTTON) {
            leftDots = true;
        }
    }
    if(pagesOnTheRight > BUTTONS_ON_ONE_SIDE) {
        renderLastButton = true;
        if(pagesOnTheRight > BUTTONS_ON_ONE_SIDE + ACTIVE_BUTTON) {
            rightDots = true;
        }
    }
    if(pagesOnTheLeft < BUTTONS_ON_ONE_SIDE) {
        prevButtons = pagesOnTheLeft;
    }
    if(pagesOnTheRight < BUTTONS_ON_ONE_SIDE) {
        nextButtons = pagesOnTheRight;
    }
    return {
        lastPage: lastPage,
        currentPage: currentPage,
        prevButtons: prevButtons,
        nextButtons: nextButtons,
        leftDots: leftDots,
        rightDots: rightDots,
        renderFirstButton : renderFirstButton,
        renderLastButton: renderLastButton
    };
}