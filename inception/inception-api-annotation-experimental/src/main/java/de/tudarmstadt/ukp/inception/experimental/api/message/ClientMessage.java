package de.tudarmstadt.ukp.inception.experimental.api.message;

public class ClientMessage
{
    private String username;
    private String clientName;
    private long project;
    private long document;
    private int[][] viewport;
    private int annotationAddress;
    private String annotationType;
    private int annotationOffsetBegin;
    private int annotationOffsetEnd;
    private String offsetType;


    public ClientMessage()
    {
        //Default
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getUsername()
    {
        return username;
    }

    public void setUsername(String username)
    {
        this.username = username;
    }

    public long getProject()
    {
        return project;
    }

    public void setProject(long project)
    {
        this.project = project;
    }

    public long getDocument()
    {
        return document;
    }

    public void setDocument(long document)
    {
        this.document = document;
    }

    public int[][] getViewport()
    {
        return viewport;
    }

    public void setViewport(int[][] viewport)
    {
        this.viewport = viewport;
    }

    public int getAnnotationAddress()
    {
        return annotationAddress;
    }

    public void setAnnotationAddress(int annotationAddress)
    {
        this.annotationAddress = annotationAddress;
    }

    public String getAnnotationType()
    {
        return annotationType;
    }

    public void setAnnotationType(String annotationType)
    {
        this.annotationType = annotationType;
    }

    public int getAnnotationOffsetBegin()
    {
        return annotationOffsetBegin;
    }

    public void setAnnotationOffsetBegin(int aAnnotationOffsetBegin)
    {
        annotationOffsetBegin = aAnnotationOffsetBegin;
    }

    public int getAnnotationOffsetEnd()
    {
        return annotationOffsetEnd;
    }

    public void setAnnotationOffsetEnd(int aAannotationOffsetEnd)
    {
        annotationOffsetEnd = aAannotationOffsetEnd;
    }

    public String getOffsetType()
    {
        return offsetType;
    }

    public void setOffsetType(String aOffsetType)
    {
        offsetType = aOffsetType;
    }
}
