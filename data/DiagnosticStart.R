#Overall

#The code here aims to begin the statistical diagnostics that we wish to see more of in the tool. 
#All the indicators need to be tested for multicollinearity, normality, and linearity (conditions for 
#structural equation models). 

#################################################################################################


###Education
edu <- read.csv("Education_indicators.csv")

edu <- edu[complete.cases(edu),]
edu <- edu[,-1]
edu[,1:33] <- lapply(edu[,1:33], as.numeric)
plot(edu)
corrplot(cor(edu), method = "number", type = "lower")

temp.r <- abs(cor(edu)) # get correlations
temp.col <- dmat.color(temp.r) # get colors
temp.o <- order.single(temp.r)
cpairs(edu,  panel.colors = temp.col)


###################################################################################################


###Context
cont <- read.csv("Context_indicators.csv")

cont <- cont[complete.cases(cont),]
cont <- cont[,-1]
cont[,1:18] <- lapply(cont[,1:18], as.numeric)
plot(cont)
corrplot(cor(cont), method = "number", type = "lower")


###################################################################################################


###Housing
house <- read.csv("Housing_indicators.csv")
house <- house[complete.cases(house),]
house <- house[,-1]
house[,1:5] <- lapply(house[,1:5], as.numeric)
plot(house)
corrplot(cor(house), method = "number")


###################################################################################################


###Income
inc <- read.csv("Income_indicators.csv")
inc <- inc[complete.cases(inc),]
inc <- inc[,-1]
inc[,1:18] <- lapply(inc[,1:18], as.numeric)
plot(inc)
corrplot(cor(inc), method = "number", type = "lower")












