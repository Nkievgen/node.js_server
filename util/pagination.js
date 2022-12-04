const ITEMS_PER_PAGE = 4;
const NAV_BUTTONS_QTY = 9;
const FIRST_PAGE = 1;
const ACTIVE_BUTTON = 1;
const BUTTONS_ON_ONE_SIDE = Math.floor((NAV_BUTTONS_QTY / 2));

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

exports.currentPage = (page) => {
    return getCurrentPage(page);
}

exports.toView = (page, totalItems,) => {
    const lastPage = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const currentPage = getCurrentPage(page);

    let renderFirstButton = true;
    let renderLastButton = true;
    let prevButtons = BUTTONS_ON_ONE_SIDE;
    let nextButtons = BUTTONS_ON_ONE_SIDE;
    let rightDots = false;
    let leftDots = false;
    if(lastPage === FIRST_PAGE) {
        prevButtons = 0;
        nextButtons = 0;
    }
     else {
        const pagesOnTheLeft = page - ACTIVE_BUTTON;
        const pagesOnTheRight = lastPage - page;
        if (pagesOnTheLeft <= BUTTONS_ON_ONE_SIDE) {
            renderFirstButton = false;
        }
        if (pagesOnTheLeft > BUTTONS_ON_ONE_SIDE + ACTIVE_BUTTON) {
            leftDots = true;
        }
        if(pagesOnTheRight <= BUTTONS_ON_ONE_SIDE) { // 
            renderLastButton = false;
        }
        if(pagesOnTheRight > BUTTONS_ON_ONE_SIDE + ACTIVE_BUTTON) {
            rightDots = true;
        }
        if(pagesOnTheLeft < BUTTONS_ON_ONE_SIDE) {
            prevButtons = pagesOnTheLeft;
        }
        if(pagesOnTheRight < BUTTONS_ON_ONE_SIDE) {
            nextButtons = pagesOnTheRight;
        }
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